// pages/api/products/user/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const products = await prisma.product.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}
