import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(200).json({ count: 0 });

  const userId = session.user.id;

  const count = await prisma.message.count({
    where: {
      read: false,
      NOT: { senderId: userId },
      conversation: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    },
  });

  return res.status(200).json({ count });
}
