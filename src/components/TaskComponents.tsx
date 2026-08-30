"use client";

import { useTransition } from "react";
import { toggleTask, addTask } from "@/app/actions";

export function TaskItem({ task, currentUserId }: { task: any, currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const isCompleted = task.status === "completed";

  return (
    <div className="checklist-item lined-paper" style={{ opacity: isPending ? 0.5 : 1 }}>
      <div 
        className={`checklist-circle ${isCompleted ? 'completed' : ''}`}
        onClick={() => startTransition(() => toggleTask(task.id, task.status, currentUserId))}
      />
      <span className={`task-text font-handwriting ${isCompleted ? 'completed' : ''}`}>
        {task.title}
        {task.assignedToId !== task.assignedById && (
          <span style={{ fontSize: '1rem', marginLeft: '8px', color: 'var(--text-secondary-brown)', textDecoration: 'none' }}>
            (for {task.assignedTo?.name || 'Friend'})
          </span>
        )}
      </span>
    </div>
  );
}

export function TaskForm({ currentUserId, friendUserId, date, status = "pending", defaultAssigneeId }: { currentUserId: string, friendUserId: string, date: string, status?: string, defaultAssigneeId?: string }) {
  return (
    <form action={addTask} className="flex-row items-center lined-paper mt-4">
      <div className="checklist-circle" style={{ border: '2px dashed var(--border-soft-brown)' }}></div>
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="assignedById" value={currentUserId} />
      <input type="hidden" name="status" value={status} />
      <input 
        type="text" 
        name="title" 
        placeholder="Add a new task..." 
        className="font-handwriting"
        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.4rem' }} 
        required
      />
      <select name="assignedToId" defaultValue={defaultAssigneeId || currentUserId} style={{ width: 'auto', background: 'transparent', border: '1px dashed var(--border-soft-brown)' }}>
        <option value={currentUserId}>For Me</option>
        <option value={friendUserId}>For Friend</option>
      </select>
      <button type="submit" className="btn-secondary" style={{ padding: '2px 12px', fontSize: '1rem', fontFamily: 'var(--font-caveat)' }}>Add</button>
    </form>
  );
}
