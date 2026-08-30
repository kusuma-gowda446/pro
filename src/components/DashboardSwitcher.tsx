"use client";

import { switchView, verifyAndSwitchView } from "@/app/actions";
import { Eye, X } from "lucide-react";
import { useState } from "react";

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
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  
  const handleSwitchToFriend = () => {
    if (isViewingFriend) return;
    setShowPinPrompt(true);
    setPin("");
    setError("");
  };

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyAndSwitchView(friendUser.id, pin);
    if (res.success) {
      setShowPinPrompt(false);
    } else {
      setError(res.error || "Incorrect PIN");
    }
  };
  
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
      <div className="dashboard-switcher">
        <button 
          className={`switcher-btn ${!isViewingFriend ? 'active' : ''}`}
          onClick={() => {
            setShowPinPrompt(false);
            switchView(currentUser.id);
          }}
        >
          {currentUser.name}
        </button>
        <button 
          className={`switcher-btn ${isViewingFriend ? 'active' : ''}`}
          onClick={handleSwitchToFriend}
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

      {showPinPrompt && !isViewingFriend && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          backgroundColor: 'var(--bg-cream)',
          border: '2px dashed var(--border-soft-brown)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: 'var(--paper-shadow)',
          zIndex: 100,
          width: '250px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.2rem', fontWeight: 'bold' }}>Enter {friendUser.name}'s PIN</span>
            <button onClick={() => setShowPinPrompt(false)}><X size={16} /></button>
          </div>
          <form onSubmit={submitPin} className="flex-col" style={{ gap: '8px' }}>
            <input 
              type="password" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="PIN" 
              autoFocus
              style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.2rem', letterSpacing: '0.2em' }}
            />
            {error && <span style={{ color: 'red', fontSize: '0.8rem' }}>{error}</span>}
            <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '4px' }}>Verify</button>
          </form>
        </div>
      )}
    </div>
  );
}
