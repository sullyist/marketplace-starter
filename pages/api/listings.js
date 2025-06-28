// pages/api/listings.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const listings = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json(listings);
}
