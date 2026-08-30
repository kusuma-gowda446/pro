const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findFirst();
    const roadmap = await prisma.roadmap.create({
      data: {
        title: "Test Roadmap",
        userId: user.id
      }
    });
    console.log("Created roadmap", roadmap.id);
    
    // delete
    await prisma.roadmap.delete({ where: { id: roadmap.id } });
    await prisma.trashItem.create({
      data: {
        itemType: "Roadmap",
        itemTitle: roadmap.title,
        userId: user.id
      }
    });
    console.log("Deleted roadmap and logged to trash.");
  } catch (e) {
    console.error(e);
  }
}
main();
