"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
  
  revalidatePath("/", "layout");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const assignedById = formData.get("assignedById") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const status = (formData.get("status") as string) || "pending";
  const category = (formData.get("category") as string) || null;
  
  if (!title) return;
  
  await prisma.task.create({
    data: {
      title,
      date,
      assignedById,
      assignedToId,
      status,
      category
    }
  });
  
  await logActivity("TASK_CREATED", `Added task: ${title}`, assignedById);
  revalidatePath("/", "layout");
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;
  
  await prisma.task.delete({ where: { id: taskId } });
  
  await prisma.trashItem.create({
    data: {
      itemType: "Task",
      itemTitle: task.title,
      userId
    }
  });
  
  await logActivity("TASK_DELETED", `Deleted task: ${task.title}`, userId);
  revalidatePath("/", "layout");
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

export async function switchUser(partnerId: string) {
  const cookieStore = await cookies();
  cookieStore.set("notebook_user", partnerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  revalidatePath("/", "layout");
}

export async function switchView(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set("notebook_view", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  revalidatePath("/", "layout");
}

export async function verifyAndSwitchView(targetUserId: string, pin: string) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  
  if (!user || user.pin !== pin) {
    return { success: false, error: "Incorrect PIN" };
  }
  
  const cookieStore = await cookies();
  cookieStore.set("notebook_view", targetUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  
  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("notebook_user");
  cookieStore.delete("notebook_view");
}

export async function addRoadmapMilestone(roadmapId: string, title: string, userId: string) {
  const titles = title.split('\n').map(t => t.trim()).filter(t => t.length > 0);
  
  if (titles.length === 0) return;

  await prisma.roadmapItem.createMany({
    data: titles.map(t => ({
      title: t,
      status: "pending",
      roadmapId
    }))
  });
  
  const activityDetail = titles.length > 1 
    ? `Added ${titles.length} milestones` 
    : `Added milestone: ${titles[0]}`;
    
  await prisma.activityLog.create({
    data: { actionType: "MILESTONE_CREATED", details: activityDetail, userId }
  });
  
  revalidatePath("/", "layout");
}

export async function createRoadmap(userId: string, title: string) {
  await prisma.roadmap.create({
    data: { title, type: "Personal", userId }
  });
  
  await prisma.activityLog.create({
    data: { actionType: "ROADMAP_CREATED", details: `Created new roadmap: ${title}`, userId }
  });
  
  revalidatePath("/");
}

export async function deleteRoadmap(roadmapId: string, userId: string) {
  const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
  if (!roadmap) return;
  
  await prisma.roadmap.delete({ where: { id: roadmapId } });
  
  await prisma.trashItem.create({
    data: {
      itemType: "Roadmap",
      itemTitle: roadmap.title,
      userId
    }
  });
  
  await logActivity("ROADMAP_DELETED", `Deleted roadmap: ${roadmap.title}`, userId);
  revalidatePath("/", "layout");
}

export async function deleteRoadmapMilestone(milestoneId: string, userId: string) {
  const milestone = await prisma.roadmapItem.findUnique({ where: { id: milestoneId } });
  if (!milestone) return;
  
  await prisma.roadmapItem.delete({ where: { id: milestoneId } });
  
  await prisma.trashItem.create({
    data: {
      itemType: "Milestone",
      itemTitle: milestone.title,
      userId
    }
  });
  
  await logActivity("MILESTONE_DELETED", `Deleted milestone: ${milestone.title}`, userId);
  revalidatePath("/", "layout");
}

export async function completeActivity(userId: string, activityDetails: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { currentActivity: null }
  });
  
  await prisma.activityLog.create({
    data: { actionType: "ACTIVITY_COMPLETED", details: `Completed: ${activityDetails}`, userId }
  });
  
  revalidatePath("/");
}

