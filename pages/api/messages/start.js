import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { listingId } = req.body;
  if (!listingId) return res.status(400).json({ error: 'Missing listingId' });

  const listing = await prisma.product.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  if (listing.userId === session.user.id) {
    return res.status(400).json({ error: 'You cannot message yourself' });
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId: { listingId, buyerId: session.user.id },
    },
    update: {},
    create: {
      listingId,
      buyerId: session.user.id,
      sellerId: listing.userId,
    },
  });

  return res.status(200).json({ id: conversation.id });
}
