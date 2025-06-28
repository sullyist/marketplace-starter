// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('yourpassword', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password,
    },
  });
  console.log('Seeded user');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
