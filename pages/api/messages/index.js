import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      listing: { select: { id: true, title: true, imageUrl: true, price: true } },
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const withUnread = await Promise.all(
    conversations.map(async (c) => {
      const unread = await prisma.message.count({
        where: {
          conversationId: c.id,
          read: false,
          NOT: { senderId: userId },
        },
      });
      const otherParty = c.buyerId === userId ? c.seller : c.buyer;
      return {
        id: c.id,
        listing: c.listing,
        otherParty,
        lastMessage: c.messages[0] || null,
        unread,
        updatedAt: c.updatedAt,
        role: c.buyerId === userId ? 'buyer' : 'seller',
      };
    })
  );

  const totalUnread = withUnread.reduce((sum, c) => sum + c.unread, 0);

  return res.status(200).json({ conversations: withUnread, totalUnread });
}
