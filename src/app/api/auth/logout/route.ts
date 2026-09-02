import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("notebook_user");
  cookieStore.delete("notebook_view");
  redirect("/login");
}
