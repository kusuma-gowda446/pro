"use client";

import { useTransition } from "react";
import { toggleTask, addTask, deleteTask } from "@/app/actions";
import { Trash2 } from "lucide-react";

export function TaskItem({ task, currentUserId, isOwner = true }: { task: any, currentUserId: string, isOwner?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const isCompleted = task.status === "completed";

  return (
    <div className="checklist-item lined-paper" style={{ opacity: isPending ? 0.5 : 1 }}>
      <div 
        className={`checklist-circle ${isCompleted ? 'completed' : ''}`}
        onClick={() => {
          if (!isOwner) return;
          startTransition(() => toggleTask(task.id, task.status, currentUserId));
        }}
        style={{ cursor: isOwner ? 'pointer' : 'default' }}
      />
      <span className={`task-text font-handwriting ${isCompleted ? 'completed' : ''}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>
          {task.title}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
              startTransition(() => deleteTask(task.id, currentUserId));
            }
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Delete Task"
        >
          <Trash2 size={16} color="var(--text-secondary-brown)" />
        </button>
      </span>
    </div>
  );
}

export function TaskForm({ 
  currentUserId, 
  date, 
  status = "pending", 
  category = ""
}: { 
  currentUserId: string, 
  date: string, 
  status?: string, 
  category?: string
}) {
  return (
    <form action={addTask} className="flex-row items-center lined-paper mt-4">
      <div className="checklist-circle" style={{ border: '2px dashed var(--border-soft-brown)' }}></div>
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="userId" value={currentUserId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="category" value={category} />
      <input 
        type="text" 
        name="title" 
        placeholder="Add a new task..." 
        className="font-handwriting"
        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.4rem' }} 
        required
      />
      <button type="submit" className="btn-secondary" style={{ padding: '2px 12px', fontSize: '1rem', fontFamily: 'var(--font-caveat)' }}>Add</button>
    </form>
  );
}
