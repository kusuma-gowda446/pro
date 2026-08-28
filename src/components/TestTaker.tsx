"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitTestAttempt } from "@/app/actions/tests";
import { CheckCircle, XCircle } from "lucide-react";

export function TestTaker({ test, userId }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const [startTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);

  const currentQuestion = test.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === test.questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion.id]: index });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setTimeTaken(elapsed);
    setIsSubmitted(true);
    
    let score = 0;
    const finalAnswers = test.questions.map((q: any) => {
      const selectedIndex = answers[q.id];
      const selectedAnswer = selectedIndex !== undefined ? JSON.parse(q.options)[selectedIndex] : "";
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) score++;
      
      return {
        questionId: q.id,
        selectedAnswer,
        isCorrect
      };
    });
    
    setResults({ score, total: test.questions.length, percentage: Math.round((score / test.questions.length) * 100) });
    
    startTransition(async () => {
      await submitTestAttempt(test.id, userId, score, test.questions.length, elapsed, finalAnswers);
    });
  };

  if (isSubmitted && results) {
    return (
      <div className="flex-col" style={{ gap: '24px' }}>
        <div className="card text-center" style={{ padding: '40px', background: 'var(--bg-app)' }}>
          <h2 style={{ marginBottom: '16px' }}>Test Completed!</h2>
          
          <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--bg-card)', border: `8px solid ${results.percentage >= 80 ? 'var(--accent-color)' : 'var(--border-color)'}` }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{results.percentage}%</span>
          </div>
          
          <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>You scored {results.score} out of {results.total}</p>
          <p className="text-muted">Time taken: {Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
          
          <div style={{ marginTop: '32px' }}>
            <button className="btn-primary" onClick={() => router.push("/tests")}>Back to Tests</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '24px' }}>Review Answers</h3>
          <div className="flex-col" style={{ gap: '24px' }}>
            {test.questions.map((q: any, idx: number) => {
              const selectedIdx = answers[q.id];
              const options = JSON.parse(q.options);
              const selectedAnswer = selectedIdx !== undefined ? options[selectedIdx] : "";
              const isCorrect = selectedAnswer === q.correctAnswer;
              
              return (
                <div key={q.id} style={{ paddingBottom: '24px', borderBottom: idx < test.questions.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ marginTop: '2px' }}>
                      {isCorrect ? <CheckCircle color="var(--accent-color)" size={20} /> : <XCircle color="#ef4444" size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px' }}>{idx + 1}. {q.question}</div>
                      <div style={{ fontSize: '0.95rem' }}>
                        <div>Your answer: <span style={{ color: isCorrect ? 'var(--accent-color)' : '#ef4444', fontWeight: '500' }}>{selectedAnswer || 'Skipped'}</span></div>
                        {!isCorrect && <div>Correct answer: <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>{q.correctAnswer}</span></div>}
                      </div>
                    </div>
                  </div>
                  
                  {q.explanation && (
                    <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '32px' }}>
                      <span style={{ fontWeight: '600' }}>Explanation: </span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const options = JSON.parse(currentQuestion.options);

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '24px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '600' }}>Question {currentQuestionIdx + 1} of {test.questions.length}</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {test.questions.map((_: any, idx: number) => (
            <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === currentQuestionIdx ? 'var(--accent-color)' : (answers[test.questions[idx].id] !== undefined ? 'var(--border-focus)' : 'var(--border-color)') }} />
          ))}
        </div>
      </div>
      
      <div style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '32px' }}>{currentQuestion.question}</h2>
        
        <div className="flex-col" style={{ gap: '16px' }}>
          {options.map((opt: string, idx: number) => (
            <div 
              key={idx}
              onClick={() => handleSelectOption(idx)}
              style={{ 
                padding: '16px 20px', 
                border: answers[currentQuestion.id] === idx ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-sm)',
                background: answers[currentQuestion.id] === idx ? 'var(--bg-app)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: answers[currentQuestion.id] === idx ? '6px solid var(--accent-color)' : '1px solid var(--border-color)', transition: 'all 0.2s' }} />
              <div style={{ fontSize: '1.1rem' }}>{opt}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
        <button 
          className="btn-secondary" 
          onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIdx === 0}
        >
          Previous
        </button>
        
        <button 
          className="btn-primary" 
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
        >
          {isLastQuestion ? 'Submit Test' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
