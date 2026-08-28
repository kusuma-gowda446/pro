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

export async function getPartnerUser(currentUserId: string) {
  return prisma.user.findFirst({
    where: {
      id: { not: currentUserId }
    }
  });
}
