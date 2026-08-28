"use client";

import { useState, useTransition } from "react";
import { addLearningTopic, updateLearningTopic } from "@/app/actions/learning";

export function LearningApp({ topics, userId, isOwner, currentUserId }: any) {
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      topic: formData.get("topic"),
      category: formData.get("category"),
      difficulty: formData.get("difficulty")
    };
    startTransition(async () => {
      await addLearningTopic(userId, currentUserId, data);
      setShowAdd(false);
    });
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    startTransition(async () => {
      await updateLearningTopic(id, currentUserId, { progress });
    });
  };

  const handleUpdateStatus = (id: string, status: string) => {
    startTransition(async () => {
      await updateLearningTopic(id, currentUserId, { status });
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "Completed") return "status-completed";
    if (status === "Learning" || status === "In Progress") return "status-progress";
    if (status === "Planned") return "status-planned";
    return "status-planned";
  };

  return (
    <div className="flex-col" style={{ gap: '24px' }}>
      {isOwner && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? "Cancel" : "Add Topic"}
          </button>
        </div>
      )}

      {showAdd && isOwner && (
        <form onSubmit={handleAdd} className="card" style={{ display: 'flex', gap: '16px', background: 'var(--bg-sidebar)', alignItems: 'center', flexWrap: 'wrap' }}>
          <input name="topic" placeholder="Topic Name (e.g. Generative AI)" required style={{ flex: '1 1 200px' }} />
          <input name="category" placeholder="Category" style={{ flex: '1 1 150px' }} />
          <select name="difficulty" style={{ flex: '0 0 150px' }}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button type="submit" className="btn-primary" disabled={isPending}>Save</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {topics.map((t: any) => (
          <div key={t.id} className="card" style={{ opacity: isPending ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t.topic}</h3>
                <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>{t.category || 'Uncategorized'} • {t.difficulty || 'Normal'}</div>
              </div>
              <span className={`status-badge ${getStatusColor(t.status)}`}>{t.status}</span>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span className="text-muted">Progress</span>
                <span style={{ fontWeight: '600' }}>{t.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${t.progress}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>
            
            {isOwner && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select 
                  value={t.status} 
                  onChange={e => handleUpdateStatus(t.id, e.target.value)}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="Planned">Planned</option>
                  <option value="Learning">Learning</option>
                  <option value="Completed">Completed</option>
                </select>
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={t.progress}
                  onChange={e => handleUpdateProgress(t.id, parseInt(e.target.value))}
                  style={{ width: '90px', padding: '6px 12px', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            )}
          </div>
        ))}
        {topics.length === 0 && <p className="text-muted">No learning topics found.</p>}
      </div>
    </div>
  );
}
