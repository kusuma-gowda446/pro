import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const motu = await prisma.user.upsert({
    where: { pin: '4426' },
    update: {},
    create: {
      name: 'Motu',
      pin: '4426',
    },
  });

  console.log({ motu });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
