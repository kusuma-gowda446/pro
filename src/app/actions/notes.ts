"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createNote(userId: string, currentUserId: string) {
  if (userId !== currentUserId) throw new Error("Unauthorized");
  
  const note = await prisma.note.create({
    data: {
      userId,
      title: "New Note",
      content: "",
      date: new Date().toISOString().split('T')[0]
    },
    include: { attachments: true }
  });
  
  await prisma.activityLog.create({
    data: { actionType: "NOTE_CREATED", details: `Created a new note`, userId }
  });
  
  revalidatePath("/notes");
  return note;
}

export async function updateNote(id: string, data: any, currentUserId: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.userId !== currentUserId) throw new Error("Unauthorized");
  
  await prisma.note.update({
    where: { id },
    data
  });
  
  revalidatePath("/notes");
}

export async function deleteNote(id: string, currentUserId: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.userId !== currentUserId) throw new Error("Unauthorized");
  
  await prisma.note.delete({ where: { id } });
  
  revalidatePath("/notes");
}

export async function addAttachment(noteId: string, data: { fileName: string, fileType: string, fileSize: number, fileUrl: string }) {
  const attachment = await prisma.noteAttachment.create({
    data: {
      noteId,
      ...data
    }
  });
  
  revalidatePath("/notes");
  return attachment;
}
