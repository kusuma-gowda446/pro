"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleTask(taskId: string, status: string, userId: string) {
  const newStatus = status === "completed" ? "pending" : "completed";
  await prisma.task.update({
    where: { id: taskId },
    data: { 
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : null
    }
  });
  
  if (newStatus === "completed") {
    await logActivity("TASK_COMPLETED", "Completed a task", userId);
  }
  
  revalidatePath("/");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const assignedById = formData.get("assignedById") as string;
  const assignedToId = formData.get("assignedToId") as string;
  
  if (!title) return;
  
  await prisma.task.create({
    data: {
      title,
      date,
      assignedById,
      assignedToId
    }
  });
  
  await logActivity("TASK_CREATED", `Added task: ${title}`, assignedById);
  revalidatePath("/");
}

export async function updateDailyReport(formData: FormData) {
  const userId = formData.get("userId") as string;
  const date = formData.get("date") as string;
  
  const data = {
    workedOn: formData.get("workedOn") as string,
    completed: formData.get("completed") as string,
    learned: formData.get("learned") as string,
    difficult: formData.get("difficult") as string,
    improve: formData.get("improve") as string,
    productivity: parseInt(formData.get("productivity") as string) || 5,
    mood: formData.get("mood") as string,
  };
  
  await prisma.dailyReport.upsert({
    where: {
      date_userId: { date, userId }
    },
    update: data,
    create: {
      userId,
      date,
      ...data
    }
  });
  
  await logActivity("REPORT_UPDATED", "Updated daily report", userId);
  revalidatePath("/");
}

export async function addPriority(formData: FormData) {
  const content = formData.get("content") as string;
  const userId = formData.get("userId") as string;
  const date = formData.get("date") as string;
  
  if (!content) return;
  
  await prisma.priority.create({
    data: { content, userId, date }
  });
  revalidatePath("/");
}

export async function addReminder(formData: FormData) {
  const content = formData.get("content") as string;
  if (!content) return;
  
  await prisma.reminder.create({
    data: { content }
  });
  revalidatePath("/");
}

export async function logActivity(actionType: string, details: string, userId: string) {
  await prisma.activityLog.create({
    data: { actionType, details, userId }
  });
}
