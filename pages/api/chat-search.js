// pages/api/chat-search.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { message } = req.body;

  const brandMatch = message.match(/\b(honda|yamaha|suzuki|ducati|kawasaki|ktm)\b/i);
  const priceMatch = message.match(/\bunder\s+(\d+)/i);

  const filters = {};
  if (brandMatch) filters.title = { contains: brandMatch[1], mode: 'insensitive' };
  if (priceMatch) filters.price = { lt: parseFloat(priceMatch[1]) };

  try {
    const products = await prisma.product.findMany({
      where: filters,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      return res.json({ reply: "I couldn't find any matching ads." });
    }

    const listings = products.map(p => `• ${p.title} – €${p.price}`).join('\n');
    return res.json({ reply: `Here are some matches:\n${listings}` });
  } catch (err) {
    console.error('Chat search error:', err);
    return res.status(500).json({ reply: 'Oops! Something went wrong.' });
  }
}
