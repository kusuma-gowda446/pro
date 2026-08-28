"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  
  if (pathname === "/login") return null;

  const links = [
    { href: "/", label: "Today" },
    { href: "/notes", label: "Notes" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/history", label: "History" },
    { href: "/journey", label: "Journey" },
    { href: "/progress", label: "Progress" },
  ];

  return (
    <nav style={{
      position: 'absolute',
      bottom: '-60px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '10px 20px',
      backgroundColor: 'var(--bg-cream)',
      boxShadow: 'var(--paper-shadow)',
      borderRadius: '8px',
      zIndex: 100,
      width: 'max-content',
      maxWidth: '90vw'
    }}>
      {links.map(link => (
        <Link 
          key={link.href} 
          href={link.href}
          style={{
            fontFamily: 'var(--font-lora)',
            fontWeight: pathname === link.href ? 'bold' : 'normal',
            color: pathname === link.href ? 'var(--text-dark-brown)' : 'var(--text-secondary-brown)',
            borderBottom: pathname === link.href ? '2px solid var(--text-dark-brown)' : 'none',
            paddingBottom: '2px',
            textTransform: 'uppercase',
            fontSize: '0.9rem',
            letterSpacing: '0.05em'
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
