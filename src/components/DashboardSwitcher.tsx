"use client";

import { switchView } from "@/app/actions";
import { Eye } from "lucide-react";

export function DashboardSwitcher({ 
  currentUser, 
  viewingUser, 
  friendUser 
}: { 
  currentUser: any, 
  viewingUser: any, 
  friendUser: any 
}) {
  const isViewingFriend = currentUser.id !== viewingUser.id;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
      <div className="dashboard-switcher">
        <button 
          className={`switcher-btn ${!isViewingFriend ? 'active' : ''}`}
          onClick={() => switchView(currentUser.id)}
        >
          {currentUser.name}
        </button>
        <button 
          className={`switcher-btn ${isViewingFriend ? 'active' : ''}`}
          onClick={() => switchView(friendUser.id)}
        >
          {friendUser.name}
        </button>
      </div>
      {isViewingFriend && (
        <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-tertiary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={14} />
          Viewing {friendUser.name}'s Space
        </div>
      )}
    </div>
  );
}
