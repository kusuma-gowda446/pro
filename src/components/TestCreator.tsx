"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTest } from "@/app/actions/tests";
import { Plus, Trash2 } from "lucide-react";

export function TestCreator({ topics, userId, currentUserId }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [topicId, setTopicId] = useState(topics[0]?.id || "");
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQ = [...questions];
    (newQ[index] as any)[field] = value;
    setQuestions(newQ);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = value;
    setQuestions(newQ);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !topicId || questions.length === 0) return;
    
    startTransition(async () => {
      try {
        await createTest(userId, currentUserId, { title, topicId, questions });
        router.push("/tests");
      } catch (err) {
        console.error(err);
      }
    });
  };

  if (topics.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '40px' }}>
        <h3 style={{ marginBottom: '16px' }}>No Learning Topics Found</h3>
        <p className="text-muted" style={{ marginBottom: '24px' }}>You need to create a learning topic before you can create a test.</p>
        <button className="btn-primary" onClick={() => router.push("/learning")}>Go to Learning</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '24px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>Test Details</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Test Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. SQL Joins Basics" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Learning Topic</label>
            <select value={topicId} onChange={e => setTopicId(e.target.value)} required>
              {topics.map((t: any) => (
                <option key={t.id} value={t.id}>{t.topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-col" style={{ gap: '16px' }}>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="card" style={{ position: 'relative' }}>
            {questions.length > 1 && (
              <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-tertiary)' }}>
                <Trash2 size={20} />
              </button>
            )}
            <h3 style={{ marginBottom: '16px' }}>Question {qIndex + 1}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <input value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} required placeholder="Enter question..." style={{ fontSize: '1.1rem', padding: '12px' }} />
            </div>
            
            <div className="options-grid">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: q.correctAnswer === oIndex ? '1px solid var(--accent-color)' : '1px solid transparent' }}>
                  <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === oIndex} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)} style={{ width: 'auto' }} />
                  <input value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} required placeholder={`Option ${oIndex + 1}`} style={{ flex: 1, border: 'none', background: 'transparent' }} />
                </div>
              ))}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Explanation (Optional)</label>
              <textarea value={q.explanation} onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)} placeholder="Why is this correct?" style={{ minHeight: '60px' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' }}>
        <button type="button" onClick={handleAddQuestion} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Question
        </button>
        <button type="submit" className="btn-primary" disabled={isPending} style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
          {isPending ? 'Saving...' : 'Create Test'}
        </button>
      </div>
    </form>
  );
}
