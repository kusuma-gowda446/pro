"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DeleteButton } from "./DeleteButton";

export function RoadmapAccordionItem({ 
  roadmap, 
  progressStr, 
  children,
  onDelete
}: { 
  roadmap: { title: string }, 
  progressStr: string, 
  children: React.ReactNode,
  onDelete?: () => Promise<void>
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-soft-brown)' }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: isOpen ? '2px solid var(--text-dark-brown)' : 'none', 
          paddingBottom: isOpen ? '10px' : '0', 
          marginBottom: isOpen ? '20px' : '0',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
          {roadmap.title.toUpperCase()}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="font-handwriting" style={{ color: 'var(--text-secondary-brown)', fontSize: '1.1rem' }}>{progressStr}</span>
          {onDelete && (
            <DeleteButton 
              onDelete={onDelete} 
              confirmMessage={`Are you sure you want to delete the roadmap '${roadmap.title}'? This will delete all milestones inside it.`} 
              title="Delete Roadmap" 
              size={18}
            />
          )}
        </div>
      </div>
      
      {isOpen && (
        <div className="accordion-content-anim">
          {children}
        </div>
      )}
    </div>
  );
}
