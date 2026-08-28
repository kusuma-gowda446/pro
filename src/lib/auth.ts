import { cookies } from "next/headers";
import { prisma } from "./db";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("notebook_user")?.value;
  
  if (!userId) {
    redirect("/login");
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    cookieStore.delete("notebook_user");
    redirect("/login");
  }
  
  return user;
}

export async function getFriendUser(currentUserId: string) {
  return prisma.user.findFirst({
    where: {
      id: { not: currentUserId }
    }
  });
}

export async function getViewingUser() {
  const currentUser = await getCurrentUser();
  const cookieStore = await cookies();
  const viewingUserId = cookieStore.get("notebook_view")?.value;
  
  if (viewingUserId && viewingUserId !== currentUser.id) {
    const viewingUser = await prisma.user.findUnique({ where: { id: viewingUserId } });
    if (viewingUser) {
      return { viewingUser, currentUser, isOwner: false };
    }
  }
  
  return { viewingUser: currentUser, currentUser, isOwner: true };
}
