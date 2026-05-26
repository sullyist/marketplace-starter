import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

async function loadConversation(id, userId) {
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, imageUrl: true, price: true } },
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
    },
  });
  if (!conv) return null;
  if (conv.buyerId !== userId && conv.sellerId !== userId) return 'forbidden';
  return conv;
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.query;
  const userId = session.user.id;
  const conv = await loadConversation(id, userId);
  if (!conv) return res.status(404).json({ error: 'Not found' });
  if (conv === 'forbidden') return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.message.updateMany({
      where: {
        conversationId: id,
        read: false,
        NOT: { senderId: userId },
      },
      data: { read: true },
    });

    const otherParty = conv.buyerId === userId ? conv.seller : conv.buyer;
    return res.status(200).json({
      id: conv.id,
      listing: conv.listing,
      otherParty,
      messages,
      role: conv.buyerId === userId ? 'buyer' : 'seller',
    });
  }

  if (req.method === 'POST') {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (body.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        body: body.trim(),
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return res.status(200).json({ message });
  }

  return res.status(405).end();
}
