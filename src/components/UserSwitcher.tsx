import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SwitchUserButton } from "./SwitchUserButton";

export async function UserSwitcher() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("notebook_user")?.value;
  
  if (!userId) return null;
  
  const partnerUser = await prisma.user.findFirst({
    where: { id: { not: userId } }
  });
  
  if (!partnerUser) return null;
  
  return (
    <div style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 100 }}>
      <SwitchUserButton partnerId={partnerUser.id} partnerName={partnerUser.name} />
    </div>
  );
}
