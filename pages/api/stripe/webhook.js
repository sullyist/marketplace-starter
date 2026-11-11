import { PrismaClient } from '@prisma/client';
import { stripe } from '../../../lib/stripe';
import { DEALER_SUBSCRIPTION, CURRENCY } from '../../../lib/pricing';

const prisma = new PrismaClient();

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handleFeaturedCheckout(session) {
  const { listingId, durationDays } = session.metadata || {};
  if (!listingId) {
    console.warn('[stripe webhook] featured checkout missing listingId:', session.id);
    return;
  }

  const existing = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing?.status === 'succeeded') return;

  const days = parseInt(durationDays, 10) || 7;
  const listing = await prisma.product.findUnique({ where: { id: listingId } });
  if (!listing) {
    console.warn('[stripe webhook] listing gone, logging payment only:', listingId);
  } else {
    const now = new Date();
    const base = listing.featuredUntil && listing.featuredUntil > now ? listing.featuredUntil : now;
    const featuredUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    await prisma.product.update({
      where: { id: listingId },
      data: { featuredUntil },
    });
  }

  await prisma.payment.update({
    where: { stripeSessionId: session.id },
    data: {
      status: 'succeeded',
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    },
  });
}

async function handleDealerCheckout(session) {
  const { userId } = session.metadata || {};
  if (!userId) {
    console.warn('[stripe webhook] dealer checkout missing userId:', session.id);
    return;
  }
  if (!session.subscription || !session.customer) return;

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription.id;
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      dealerUntil: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function syncSubscription(subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) {
    console.warn('[stripe webhook] no user for customer', customerId);
    return;
  }

  const active = ['active', 'trialing', 'past_due'].includes(subscription.status);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscription.id,
      dealerUntil: active ? new Date(subscription.current_period_end * 1000) : null,
    },
  });
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeSubscriptionId: null, dealerUntil: null },
  });
}

async function logInvoicePayment(invoice, status) {
  if (!invoice.id || !invoice.customer) return;
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  const existing = await prisma.payment.findUnique({ where: { stripeInvoiceId: invoice.id } });
  if (existing) return;

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: invoice.amount_paid || invoice.amount_due || DEALER_SUBSCRIPTION.amount,
      currency: invoice.currency || CURRENCY,
      type: 'dealer_subscription',
      stripeInvoiceId: invoice.id,
      status,
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('[stripe webhook] received:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.metadata?.type === 'featured') {
          await handleFeaturedCheckout(session);
        } else if (session.metadata?.type === 'dealer') {
          await handleDealerCheckout(session);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await syncSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await logInvoicePayment(event.data.object, 'succeeded');
        break;
      case 'invoice.payment_failed':
        await logInvoicePayment(event.data.object, 'failed');
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] handler error for', event.type, err);
    return res.status(500).json({ error: 'Handler failed' });
  }

  return res.status(200).json({ received: true });
}
