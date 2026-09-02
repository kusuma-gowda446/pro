import type { Metadata } from "next";
import { Caveat, Lora } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AutoLock } from "@/components/AutoLock";
import { getViewingUser } from "@/lib/auth";
import { cookies } from "next/headers";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Motu — My Notebook",
  description: "A private digital workspace for Motu",
};

function SpiralBinding() {
  const holes = Array.from({ length: 32 });
  return (
    <div className="spiral-binding">
      {holes.map((_, i) => (
        <div key={i} style={{ position: 'relative', width: '20px', height: '100%' }}>
          <div className="notebook-hole" style={{ left: '6px' }}></div>
          <div className="spiral-ring" style={{ position: 'absolute', left: '4px' }}></div>
        </div>
      ))}
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("notebook_user")?.value;
  
  if (!userId) {
    return (
      <html lang="en">
        <body className={`${lora.variable} ${caveat.variable} ${lora.className}`}>
          <div className="notebook-container">
            <SpiralBinding />
            <div className="app-container">
              <main className="main-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
                {children}
              </main>
            </div>
          </div>
        </body>
      </html>
    );
  }

  const { currentUser, viewingUser } = await getViewingUser();

  return (
    <html lang="en">
      <body className={`${lora.variable} ${caveat.variable} ${lora.className}`}>
        <AutoLock />
        <div className="notebook-container">
          <SpiralBinding />
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <div className="topbar">
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {viewingUser.name}'s Notebook
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
