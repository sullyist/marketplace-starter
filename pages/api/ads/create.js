// pages/api/ads/create.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized - Please log in.' });
  }

  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ error: 'Missing fields in request.' });
  }

  try {
    const newAd = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        user: {
          connect: { email: session.user.email },
        },
      },
    });

    return res.status(201).json(newAd);
  } catch (err) {
    console.error('❌ Error creating ad:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
