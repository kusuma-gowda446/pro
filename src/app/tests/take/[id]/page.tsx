import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TestTaker } from "@/components/TestTaker";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TakeTestPage({ params }: { params: { id: string } }) {
  const { viewingUser, currentUser } = await getViewingUser();
  
  const test = await prisma.test.findUnique({
    where: { id: params.id },
    include: {
      topic: true,
      questions: true
    }
  });

  if (!test || test.userId !== viewingUser.id) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Test not found or unauthorized</h2>
        <Link href="/tests" className="btn-secondary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Back to Tests</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 24px 24px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/tests" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Tests
        </Link>
        <h1 style={{ margin: 0 }}>{test.title}</h1>
        <p className="text-muted" style={{ marginTop: '8px' }}>
          Topic: {test.topic?.topic} • {test.questions.length} Questions
        </p>
      </div>
      
      <TestTaker test={test} userId={viewingUser.id} />
    </div>
  );
}
