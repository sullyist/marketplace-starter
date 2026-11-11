import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { dealerUntil: true, stripeCustomerId: true, stripeSubscriptionId: true },
  });

  const isDealer = !!(user?.dealerUntil && user.dealerUntil > new Date());
  return res.status(200).json({
    isDealer,
    dealerUntil: user?.dealerUntil || null,
    hasStripeCustomer: !!user?.stripeCustomerId,
    hasSubscription: !!user?.stripeSubscriptionId,
  });
}
