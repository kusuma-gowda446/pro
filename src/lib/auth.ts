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
    redirect("/api/auth/logout");
  }
  
  return user;
}

export async function getViewingUser() {
  const currentUser = await getCurrentUser();
  return { viewingUser: currentUser, currentUser, isOwner: true };
}
