import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { stripe } from '../../../lib/stripe';
import { FEATURED_LISTING, CURRENCY } from '../../../lib/pricing';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { listingId } = req.body;
  if (!listingId) return res.status(400).json({ error: 'Missing listingId' });

  const listing = await prisma.product.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.userId !== session.user.id) return res.status(403).json({ error: 'Not your listing' });

  const origin = process.env.NEXTAUTH_URL || `https://${req.headers.host}`;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: session.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: FEATURED_LISTING.amount,
          product_data: {
            name: `Feature listing: ${listing.title}`,
            description: FEATURED_LISTING.description,
          },
        },
      },
    ],
    metadata: {
      type: 'featured',
      listingId: listing.id,
      userId: session.user.id,
      durationDays: String(FEATURED_LISTING.durationDays),
    },
    success_url: `${origin}/featured/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/featured/canceled?listingId=${listing.id}`,
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      listingId: listing.id,
      amount: FEATURED_LISTING.amount,
      currency: CURRENCY,
      type: 'featured',
      stripeSessionId: checkoutSession.id,
      status: 'pending',
    },
  });

  return res.status(200).json({ url: checkoutSession.url });
}
