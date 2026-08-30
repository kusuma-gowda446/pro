"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function RoadmapSelector({ 
  roadmaps, 
  currentRoadmapId 
}: { 
  roadmaps: { id: string, title: string }[],
  currentRoadmapId: string | undefined
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(currentRoadmapId || "");

  // Update selectedId if currentRoadmapId changes from props (e.g. initial load)
  useEffect(() => {
    if (currentRoadmapId && currentRoadmapId !== selectedId) {
      setSelectedId(currentRoadmapId);
    } else if (!currentRoadmapId && roadmaps.length > 0) {
      setSelectedId(roadmaps[0].id);
    }
  }, [currentRoadmapId, roadmaps]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedId(newId);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("roadmapId", newId);
    router.push(`/?${params.toString()}`);
  };

  if (roadmaps.length === 0) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <select 
        value={selectedId} 
        onChange={handleChange}
        className="font-handwriting"
        style={{ 
          width: '100%', 
          padding: '8px 12px',
          fontSize: '1.2rem',
          backgroundColor: 'transparent',
          border: '1px solid var(--border-soft-brown)',
          borderRadius: '4px',
          color: 'var(--text-dark-brown)',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        {roadmaps.map(rm => (
          <option key={rm.id} value={rm.id}>{rm.title}</option>
        ))}
      </select>
    </div>
  );
}
