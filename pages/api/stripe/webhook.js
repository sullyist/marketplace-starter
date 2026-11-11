import { PrismaClient } from '@prisma/client';
import { stripe } from '../../../lib/stripe';

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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.metadata?.type === 'featured') {
        await handleFeaturedCheckout(session);
      }
      // dealer subscription handled in Milestone 3
    }
    // Milestone 3 also handles:
    //   customer.subscription.updated / .deleted
    //   invoice.payment_failed
  } catch (err) {
    console.error('[stripe webhook] handler error for', event.type, err);
    return res.status(500).json({ error: 'Handler failed' });
  }

  return res.status(200).json({ received: true });
}
