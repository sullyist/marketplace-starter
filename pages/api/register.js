// pages/api/register.js
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password } = req.body;
  const hashedPassword = await hash(password, 10);

  try {
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'User creation failed' });
  }
}
