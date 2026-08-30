const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const items = await prisma.trashItem.findMany();
    console.log("Trash Items:", items.length);
  } catch (e) {
    console.error(e);
  }
}
main();
