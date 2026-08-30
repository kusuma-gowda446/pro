"use client";

import Link from "next/link";
import { format } from "date-fns";
import { DeleteButton } from "./DeleteButton";
import { deleteTest } from "@/app/actions/tests";

export function TestsApp({ initialTests, topics, userId, isOwner, currentUserId }: any) {
  
  return (
    <div className="flex-col" style={{ gap: '24px' }}>
      {isOwner && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Link href="/tests/create" className="btn-primary" style={{ textDecoration: 'none' }}>
            Create New Test
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {initialTests.map((t: any) => {
          const lastAttempt = t.attempts?.[0];
          return (
            <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t.title}</h3>
                  <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                    {t.topic?.topic || 'General'} • {t.questions.length} Questions
                  </div>
                </div>
                {isOwner && (
                  <DeleteButton 
                    onDelete={deleteTest.bind(null, t.id, currentUserId)} 
                    confirmMessage={`Are you sure you want to delete the test '${t.title}'? This cannot be undone.`}
                    title="Delete Test"
                  />
                )}
              </div>
              
              <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Score</div>
                {lastAttempt ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: lastAttempt.percentage >= 80 ? 'var(--accent-color)' : 'inherit' }}>
                      {lastAttempt.percentage}%
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {lastAttempt.score} / {lastAttempt.totalQuestions} correct • {format(new Date(lastAttempt.attemptedAt), "MMM d, yyyy")}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--text-tertiary)' }}>Not taken yet</div>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <Link href={`/tests/take/${t.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', justifyContent: 'center' }}>
                  Take Test
                </Link>
              </div>
            </div>
          );
        })}
        {initialTests.length === 0 && <p className="text-muted">No tests found for this user.</p>}
      </div>
    </div>
  );
}
