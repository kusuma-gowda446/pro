import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const buddy = await prisma.user.upsert({
    where: { pin: '4421' },
    update: {},
    create: {
      name: 'Buddy',
      pin: '4421',
    },
  });

  const kiddo = await prisma.user.upsert({
    where: { pin: '4426' },
    update: {},
    create: {
      name: 'Kiddo',
      pin: '4426',
    },
  });

  console.log({ buddy, kiddo });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
