// pages/api/listings.js
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const listings = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(listings);
  }

  if (req.method === 'POST') {
    // Get the logged-in user
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      title,
      make,
      model,
      price,
      engineSize,
      power,
      bikeType,
      location,
      description,
      imageUrl,
    } = req.body;

    // Basic validation
    if (!title || !make || !model || !price || !engineSize || !bikeType || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const product = await prisma.product.create({
        data: {
          title: title.trim(),
          make: make.trim(),
          model: model.trim(),
          makeModel: `${make.trim()} ${model.trim()}`,
          description: description || '',
          price: parseFloat(price),
          engineSize: engineSize.toString(),
          power: power ? power.trim() : 'Unknown',
          bikeType: bikeType,
          location: location.trim(),
          imageUrl: imageUrl || 'https://placehold.co/600x400/gray/white?text=No+Image',
          userId: session.user.id,
        },
      });

      return res.status(201).json({ id: product.id, success: true });
    } catch (error) {
      console.error('Error creating listing:', error);
      return res.status(500).json({ error: 'Failed to create listing' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
