// scripts/updateAdminPassword.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com'; // Replace with your admin email
  const newPassword = 'NewSecurePassword123!'; // Replace with new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log(`✅ Admin password updated for ${updated.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error updating password:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
