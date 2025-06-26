import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ include: { user: true } });
    res.json(products);
  } else if (req.method === 'POST') {
    const { title, description, price, imageUrl, userId } = req.body;
    const product = await prisma.product.create({
      data: { title, description, price: parseFloat(price), imageUrl, userId }
    });
    res.status(201).json(product);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
