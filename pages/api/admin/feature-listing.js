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

  const { listingId, days } = req.body;
  const d = parseInt(days, 10);
  if (!listingId || !Number.isFinite(d) || d < 0 || d > 365) {
    return res.status(400).json({ error: 'Invalid listingId or days (0–365)' });
  }

  const listing = await prisma.product.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  let featuredUntil = null;
  if (d > 0) {
    const now = new Date();
    const base = listing.featuredUntil && listing.featuredUntil > now ? listing.featuredUntil : now;
    featuredUntil = new Date(base.getTime() + d * 24 * 60 * 60 * 1000);
  }

  await prisma.product.update({
    where: { id: listingId },
    data: { featuredUntil },
  });

  await prisma.payment.create({
    data: {
      userId: listing.userId,
      listingId: listing.id,
      amount: 0,
      type: d > 0 ? 'manual_featured' : 'manual_unfeatured',
      status: 'succeeded',
    },
  });

  return res.status(200).json({ featuredUntil });
}
