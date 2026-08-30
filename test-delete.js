const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findFirst();
    const task = await prisma.task.create({
      data: {
        title: "Test Task",
        date: "2026-08-30",
        assignedById: user.id,
        assignedToId: user.id,
        status: "pending"
      }
    });
    console.log("Created task", task.id);
    
    // delete
    await prisma.task.delete({ where: { id: task.id } });
    await prisma.trashItem.create({
      data: {
        itemType: "Task",
        itemTitle: task.title,
        userId: user.id
      }
    });
    console.log("Deleted task and logged to trash.");
  } catch (e) {
    console.error(e);
  }
}
main();
