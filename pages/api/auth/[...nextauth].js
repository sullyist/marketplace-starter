import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    async authorize(credentials) {
  console.log("LOGIN attempt:", credentials.email);

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  console.log("USER from DB:", user);

  if (!user || !user.password) {
    console.log("❌ User not found or missing password");
    return null;
  }

  const isValid = await compare(credentials.password, user.password);
  console.log("✅ Password valid:", isValid);

  if (!isValid) {
    console.log("❌ Invalid password");
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
