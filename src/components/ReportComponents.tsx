"use client";

import { useTransition } from "react";
import { updateDailyReport } from "@/app/actions";

export function DailyReportForm({ userId, date, existingReport, isOwner, name }: { userId: string, date: string, existingReport: any, isOwner: boolean, name: string }) {
  const [isPending, startTransition] = useTransition();
  
  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid var(--border-soft-brown)', borderRadius: '8px', backgroundColor: isOwner ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
      <h4 style={{ fontFamily: 'var(--font-lora)', fontSize: '1.25rem', marginBottom: '15px' }}>{name}'s Report</h4>
      
      <form action={(formData) => startTransition(() => updateDailyReport(formData))}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="date" value={date} />
        
        <div className="flex-col" style={{ gap: '15px' }}>
          <div>
            <label style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>What did {name} work on today?</label>
            <textarea name="workedOn" defaultValue={existingReport?.workedOn} disabled={!isOwner} className="lined-paper" style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }} />
          </div>
          
          <div>
            <label style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>What did {name} learn?</label>
            <textarea name="learned" defaultValue={existingReport?.learned} disabled={!isOwner} className="lined-paper" style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }} />
          </div>
          
          <div>
            <label style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>What was difficult?</label>
            <textarea name="difficult" defaultValue={existingReport?.difficult} disabled={!isOwner} className="lined-paper" style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }} />
          </div>
          
          <div className="flex-row items-center">
            <label style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Productivity (1-10):</label>
            <input type="number" name="productivity" min="1" max="10" defaultValue={existingReport?.productivity || 5} disabled={!isOwner} style={{ width: '60px', fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }} />
          </div>
          
          <div className="flex-row items-center">
            <label style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Mood:</label>
            <select name="mood" defaultValue={existingReport?.mood || '🙂'} disabled={!isOwner} style={{ fontFamily: 'sans-serif', fontSize: '1.25rem', background: 'transparent', border: 'none' }}>
              <option value="😄">😄</option>
              <option value="🙂">🙂</option>
              <option value="😐">😐</option>
              <option value="😴">😴</option>
              <option value="😫">😫</option>
            </select>
          </div>
          
          {isOwner && (
            <button type="submit" className="btn-secondary" style={{ alignSelf: 'flex-start' }} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Report'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
