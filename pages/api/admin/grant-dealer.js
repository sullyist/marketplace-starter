import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { userId, days } = req.body;
  const d = parseInt(days, 10);
  if (!userId || !Number.isFinite(d) || d < 0 || d > 3650) {
    return res.status(400).json({ error: 'Invalid userId or days (0–3650)' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  let dealerUntil = null;
  if (d > 0) {
    const now = new Date();
    const base = user.dealerUntil && user.dealerUntil > now ? user.dealerUntil : now;
    dealerUntil = new Date(base.getTime() + d * 24 * 60 * 60 * 1000);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { dealerUntil },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: 0,
      type: d > 0 ? 'manual_dealer' : 'manual_dealer_revoke',
      status: 'succeeded',
    },
  });

  return res.status(200).json({ dealerUntil });
}
