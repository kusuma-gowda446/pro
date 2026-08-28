"use client";

import { useTransition } from "react";
import { toggleTask, addTask } from "@/app/actions";

export function TaskItem({ task, currentUserId }: { task: any, currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const isCompleted = task.status === "completed";

  return (
    <div className="checklist-item lined-paper">
      <div 
        className={`checklist-circle ${isCompleted ? 'completed' : ''} ${isPending ? 'opacity-50' : ''}`}
        onClick={() => startTransition(() => toggleTask(task.id, task.status, currentUserId))}
      />
      <span className={`task-text ${isCompleted ? 'completed' : ''}`} style={{ fontFamily: 'var(--font-caveat)' }}>
        {task.title}
        {task.assignedToId !== task.assignedById && (
          <span style={{ fontSize: '0.8rem', marginLeft: '8px', color: 'var(--text-secondary-brown)' }}>
            (for {task.assignedTo.name})
          </span>
        )}
      </span>
    </div>
  );
}

export function TaskForm({ currentUserId, partnerUserId, date }: { currentUserId: string, partnerUserId: string, date: string }) {
  return (
    <form action={addTask} className="flex-row items-center lined-paper mt-4">
      <div className="checklist-circle" style={{ border: '2px dashed var(--border-soft-brown)' }}></div>
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="assignedById" value={currentUserId} />
      <input 
        type="text" 
        name="title" 
        placeholder="Add a new task..." 
        style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }} 
        required
      />
      <select name="assignedToId" defaultValue={currentUserId} style={{ fontFamily: 'var(--font-caveat)', fontSize: '1rem', background: 'transparent', border: '1px dashed var(--border-soft-brown)', color: 'var(--text-dark-brown)' }}>
        <option value={currentUserId}>For Me</option>
        <option value={partnerUserId}>For Partner</option>
      </select>
      <button type="submit" className="btn-secondary" style={{ padding: '2px 8px', fontSize: '0.9rem' }}>Add</button>
    </form>
  );
}
