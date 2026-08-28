"use client";

import { useTransition, useRef, useEffect } from "react";
import { addPriority, addReminder } from "@/app/actions";

export function PriorityForm({ currentUserId, date }: { currentUserId: string, date: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={async (formData) => { await addPriority(formData); formRef.current?.reset(); }} className="flex-row items-center mt-2">
      <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }}>&bull;</span>
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="userId" value={currentUserId} />
      <input 
        type="text" 
        name="content" 
        placeholder="Add priority..." 
        style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem', borderBottom: '1px dashed var(--border-soft-brown)' }} 
        required
      />
    </form>
  );
}

export function ReminderForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={async (formData) => { await addReminder(formData); formRef.current?.reset(); }} className="flex-row items-center mt-2">
      <div className="checklist-circle" style={{ border: '2px dashed var(--border-soft-brown)' }}></div>
      <input 
        type="text" 
        name="content" 
        placeholder="Add reminder..." 
        style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }} 
        required
      />
    </form>
  );
}
