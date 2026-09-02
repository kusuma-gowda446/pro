import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("notebook_user");
  cookieStore.delete("notebook_view");
  redirect("/login");
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("notebook_user");
  cookieStore.delete("notebook_view");
  return NextResponse.json({ success: true });
}
