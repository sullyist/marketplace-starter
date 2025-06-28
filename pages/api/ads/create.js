// pages/api/ads/create.js
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const ad = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        user: {
          connect: { email: session.user.email },
        },
      },
    });

    res.status(201).json(ad);
  } catch (err) {
    console.error('Ad creation failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
