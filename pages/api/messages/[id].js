import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { sendEmail } from '../../../lib/email';

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

    const priorUnreadFromSender = await prisma.message.count({
      where: { conversationId: id, senderId: userId, read: false },
    });

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

    if (priorUnreadFromSender === 0) {
      const recipient = conv.buyerId === userId ? conv.seller : conv.buyer;
      const sender = conv.buyerId === userId ? conv.buyer : conv.seller;
      const threadUrl = `${process.env.NEXTAUTH_URL}/messages/${id}`;
      const senderName = sender.name || 'Someone';
      const safeBody = body.trim().slice(0, 300).replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'));
      sendEmail({
        to: recipient.email,
        subject: `New message about "${conv.listing.title}"`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
            <h2>New message from ${senderName}</h2>
            <p><strong>Listing:</strong> ${conv.listing.title}</p>
            <blockquote style="border-left:3px solid #ddd;padding:8px 12px;color:#333;margin:12px 0">${safeBody}</blockquote>
            <p><a href="${threadUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Reply on MotoMarket</a></p>
          </div>
        `,
      }).catch((err) => console.error('[messages] notification email failed:', err));
    }

    return res.status(200).json({ message });
  }

  return res.status(405).end();
}
