"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Map, 
  GraduationCap, 
  FlaskConical, 
  BarChart2, 
  Clock,
  LogOut,
  Trash2
} from "lucide-react";
import { logout } from "@/app/actions";

export function Sidebar() {
  const pathname = usePathname();
  
  if (pathname === "/login") return null;
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/notes", label: "Notes", icon: <BookOpen size={18} /> },
    { href: "/tasks", label: "Tasks", icon: <CheckSquare size={18} /> },
    { href: "/roadmap", label: "Roadmap", icon: <Map size={18} /> },
    { href: "/tests", label: "Tests", icon: <FlaskConical size={18} /> },
    { href: "/results", label: "Results", icon: <BarChart2 size={18} /> },
    { href: "/trash", label: "Trash", icon: <Trash2 size={18} /> },
  ];
  
  return (
    <aside className="sidebar">
      <div style={{ padding: '10px 16px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark-brown)', letterSpacing: '-0.02em', fontFamily: 'var(--font-lora)' }}>
          Motu Notebook
        </h2>
        <div className="font-handwriting" style={{ color: 'var(--text-secondary-brown)', marginTop: '-4px' }}>
          My Workspace
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`nav-link ${pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/') ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <span style={{ opacity: pathname === item.href ? 1 : 0.7 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px dashed var(--border-soft-brown)' }}>
        <button 
          onClick={() => logout()}
          className="nav-link"
          style={{ width: '100%', display: 'flex', border: 'none', background: 'transparent', textAlign: 'left', color: 'var(--text-secondary-brown)' }}
        >
          <span style={{ opacity: 0.7 }}><LogOut size={18} /></span>
          Logout
        </button>
      </div>
    </aside>
  );
}
