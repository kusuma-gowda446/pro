"use client";

import { useTransition } from "react";
import { toggleTask, addTask, deleteTask } from "@/app/actions";
import { Trash2 } from "lucide-react";

export function TaskItem({ task, currentUserId }: { task: any, currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const isCompleted = task.status === "completed";

  return (
    <div className="checklist-item lined-paper" style={{ opacity: isPending ? 0.5 : 1 }}>
      <div 
        className={`checklist-circle ${isCompleted ? 'completed' : ''}`}
        onClick={() => startTransition(() => toggleTask(task.id, task.status, currentUserId))}
      />
      <span className={`task-text font-handwriting ${isCompleted ? 'completed' : ''}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>
          {task.title}
          {task.assignedToId !== task.assignedById && (
            <span style={{ fontSize: '1rem', marginLeft: '8px', color: 'var(--text-secondary-brown)', textDecoration: 'none' }}>
              (given by {task.assignedBy?.name || 'Partner'})
            </span>
          )}
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
          <Trash2 size={16} color="var(--text-tertiary)" />
        </button>
      </span>
    </div>
  );
}

export function TaskForm({ 
  currentUserId, 
  friendUserId, 
  date, 
  status = "pending", 
  defaultAssigneeId,
  hideAssigneeDropdown = false
}: { 
  currentUserId: string, 
  friendUserId: string, 
  date: string, 
  status?: string, 
  defaultAssigneeId?: string,
  hideAssigneeDropdown?: boolean
}) {
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
      {hideAssigneeDropdown ? (
        <input type="hidden" name="assignedToId" value={defaultAssigneeId || currentUserId} />
      ) : (
        <select 
          name="assignedToId" 
          defaultValue={defaultAssigneeId || currentUserId}
          className="font-handwriting"
          style={{ border: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-secondary-brown)', marginRight: '10px' }}
        >
          <option value={currentUserId}>For Me</option>
          <option value={friendUserId}>For Partner</option>
        </select>
      )}
      <button type="submit" className="btn-secondary" style={{ padding: '2px 12px', fontSize: '1rem', fontFamily: 'var(--font-caveat)' }}>Add</button>
    </form>
  );
}
