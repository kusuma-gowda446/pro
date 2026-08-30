"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({ 
  onDelete, 
  confirmMessage = "Are you sure you want to delete this?",
  size = 16,
  title = "Delete"
}: { 
  onDelete: () => Promise<void>;
  confirmMessage?: string;
  size?: number;
  title?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(confirmMessage)) {
          startTransition(async () => {
            await onDelete();
          });
        }
      }}
      disabled={isPending}
      style={{ 
        background: 'none', 
        border: 'none', 
        cursor: isPending ? 'not-allowed' : 'pointer', 
        padding: '4px', 
        display: 'flex', 
        alignItems: 'center',
        opacity: isPending ? 0.5 : 1
      }}
      title={title}
    >
      <Trash2 size={size} color="var(--text-secondary-brown)" />
    </button>
  );
}
