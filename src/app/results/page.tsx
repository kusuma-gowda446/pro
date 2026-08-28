import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export default async function ResultsPage() {
  const { viewingUser } = await getViewingUser();
  
  const attempts = await prisma.testAttempt.findMany({
    where: { userId: viewingUser.id },
    include: { test: { include: { topic: true } } },
    orderBy: { attemptedAt: 'desc' }
  });

  const topics = await prisma.learningTopic.findMany({
    where: { userId: viewingUser.id }
  });

  // Calculate stats
  const totalTestsTaken = attempts.length;
  const averageScore = totalTestsTaken > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalTestsTaken) 
    : 0;
  
  const overallProgress = topics.length > 0 
    ? Math.round(topics.reduce((acc, curr) => acc + curr.progress, 0) / topics.length) 
    : 0;

  return (
    <div style={{ padding: '0 24px 24px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>📊 Results & Analytics</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card text-center" style={{ padding: '32px 16px' }}>
          <div className="text-muted" style={{ marginBottom: '8px' }}>Average Score</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{averageScore}%</div>
        </div>
        <div className="card text-center" style={{ padding: '32px 16px' }}>
          <div className="text-muted" style={{ marginBottom: '8px' }}>Tests Taken</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{totalTestsTaken}</div>
        </div>
        <div className="card text-center" style={{ padding: '32px 16px' }}>
          <div className="text-muted" style={{ marginBottom: '8px' }}>Learning Progress</div>
          <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{overallProgress}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Recent Test Results</h2>
          <div className="flex-col" style={{ gap: '16px' }}>
            {attempts.map(attempt => (
              <div key={attempt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{attempt.test.title}</h3>
                  <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                    {attempt.test.topic?.topic} • {format(new Date(attempt.attemptedAt), "MMM d, yyyy h:mm a")}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: attempt.percentage >= 80 ? 'var(--accent-color)' : 'inherit' }}>
                    {attempt.percentage}%
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>{attempt.score} / {attempt.totalQuestions}</div>
                </div>
              </div>
            ))}
            {attempts.length === 0 && <p className="text-muted">No test results found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
