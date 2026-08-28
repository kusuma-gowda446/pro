import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LearningApp } from "@/components/LearningApp";

export default async function LearningPage() {
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  
  const topics = await prisma.learningTopic.findMany({
    where: { userId: viewingUser.id },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div style={{ padding: '0 24px 24px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>📚 Learning Topics</h1>
      <LearningApp 
        topics={topics} 
        userId={viewingUser.id} 
        isOwner={isOwner}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
