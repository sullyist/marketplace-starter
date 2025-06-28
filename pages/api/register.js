// pages/api/register.js
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, password, name } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  res.status(201).json({ message: 'User created', user: { id: user.id, email: user.email } });
}
