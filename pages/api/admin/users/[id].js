import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { role } = req.body;
    if (!['admin', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (id === session.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }
    try {
      const user = await prisma.user.update({ where: { id }, data: { role } });
      return res.status(200).json({ id: user.id, role: user.role });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  res.setHeader('Allow', ['PATCH']);
  return res.status(405).end();
}
