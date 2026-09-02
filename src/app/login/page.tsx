import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function loginAction(formData: FormData) {
  "use server";
  
  const userType = formData.get("userType") as string;
  const pin = formData.get("pin") as string;
  
  const user = await prisma.user.findFirst({
    where: {
      name: userType,
      pin: pin
    }
  });
  
  if (user) {
    (await cookies()).set("notebook_user", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
    redirect("/");
  }
}

export default function LoginPage() {
  return (
    <div className="flex-col items-center text-center page-turn-anim" style={{ marginTop: '10vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontFamily: 'var(--font-lora)' }}>MOTU NOTEBOOK</h1>
      <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-caveat)', color: 'var(--text-secondary-brown)', marginBottom: '3rem', fontStyle: 'italic' }}>
        My little notebook
      </h2>
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
        <form action={loginAction} className="flex-col" style={{ marginTop: '1.5rem' }}>
          <input type="hidden" name="userType" value="Motu" />
          
          <div style={{ marginBottom: '2rem' }}>
            <input 
              type="password" 
              name="pin" 
              placeholder="Enter PIN..." 
              required 
              style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.5rem', letterSpacing: '0.2em' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', fontFamily: 'var(--font-caveat)', fontSize: '1.5rem' }}>
            Open Notebook &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
