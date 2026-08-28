"use client";

import { switchUser } from "@/app/actions";

export function SwitchUserButton({ partnerId, partnerName }: { partnerId: string, partnerName: string }) {
  return (
    <button 
      onClick={() => switchUser(partnerId)}
      style={{
        background: 'rgba(118, 85, 65, 0.1)',
        border: '1px solid var(--border-soft-brown)',
        padding: '8px 16px',
        borderRadius: '20px',
        fontFamily: 'var(--font-lora)',
        fontSize: '0.85rem',
        cursor: 'pointer',
        color: 'var(--text-dark-brown)',
        transition: 'all 0.2s ease',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(118, 85, 65, 0.2)'}
      onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(118, 85, 65, 0.1)'}
    >
      Switch to {partnerName}
    </button>
  );
}
