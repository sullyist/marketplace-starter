import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { stripe } from '../../../lib/stripe';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) {
    return res.status(400).json({ error: 'No Stripe customer on file' });
  }

  const origin = process.env.NEXTAUTH_URL || `https://${req.headers.host}`;

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });

  return res.status(200).json({ url: portal.url });
}
