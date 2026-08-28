"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addLearningTopic(userId: string, currentUserId: string, data: any) {
  if (userId !== currentUserId) throw new Error("Unauthorized");
  await prisma.learningTopic.create({
    data: {
      userId,
      topic: data.topic,
      category: data.category,
      difficulty: data.difficulty,
    }
  });
  revalidatePath("/learning");
}

export async function updateLearningTopic(id: string, currentUserId: string, data: any) {
  const topic = await prisma.learningTopic.findUnique({ where: { id } });
  if (!topic || topic.userId !== currentUserId) throw new Error("Unauthorized");
  await prisma.learningTopic.update({
    where: { id },
    data: { ...data, updatedAt: new Date() }
  });
  revalidatePath("/learning");
}
