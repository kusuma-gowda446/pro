import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TestsApp } from "@/components/TestsApp";

export default async function TestsPage() {
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  
  const tests = await prisma.test.findMany({
    where: { userId: viewingUser.id },
    include: { 
      topic: true,
      questions: true,
      attempts: { orderBy: { attemptedAt: 'desc' }, take: 1 } 
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const topics = await prisma.learningTopic.findMany({
    where: { userId: viewingUser.id }
  });

  return (
    <div style={{ padding: '0 24px 24px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>🧪 Tests & Quizzes</h1>
      <TestsApp 
        initialTests={tests} 
        topics={topics}
        userId={viewingUser.id} 
        isOwner={isOwner}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
