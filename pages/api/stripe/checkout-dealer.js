import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { stripe } from '../../../lib/stripe';
import { DEALER_SUBSCRIPTION, CURRENCY } from '../../../lib/pricing';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.dealerUntil && user.dealerUntil > new Date()) {
    return res.status(400).json({ error: 'You already have an active dealer subscription' });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = process.env.NEXTAUTH_URL || `https://${req.headers.host}`;

  const lineItem = DEALER_SUBSCRIPTION.stripePriceId
    ? { quantity: 1, price: DEALER_SUBSCRIPTION.stripePriceId }
    : {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: DEALER_SUBSCRIPTION.amount,
          recurring: { interval: 'month' },
          product_data: {
            name: 'MotoMarket Dealer',
            description: DEALER_SUBSCRIPTION.description,
          },
        },
      };

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [lineItem],
    metadata: {
      type: 'dealer',
      userId: user.id,
    },
    subscription_data: {
      metadata: { userId: user.id },
    },
    success_url: `${origin}/dealer/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dealer/canceled`,
  });

  return res.status(200).json({ url: checkoutSession.url });
}
