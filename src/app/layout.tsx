import type { Metadata } from "next";
import { Caveat, Lora } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { UserSwitcher } from "@/components/UserSwitcher";

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
  title: "Buddy × Kiddo — Our Notebook",
  description: "A private shared digital notebook for Buddy and Kiddo",
};

function SpiralBinding() {
  const holes = Array.from({ length: 24 });
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${caveat.variable} ${lora.className}`}>
        <div className="notebook-container">
          <UserSwitcher />
          <SpiralBinding />
          {children}
          <Navigation />
        </div>
      </body>
    </html>
  );
}
