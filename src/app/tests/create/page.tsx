import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TestCreator } from "@/components/TestCreator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { redirect } from "next/navigation";

export default async function CreateTestPage() {
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  
  if (!isOwner) {
    redirect("/tests");
  }
  
  const topics = await prisma.learningTopic.findMany({
    where: { userId: viewingUser.id },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div style={{ padding: '0 24px 24px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/tests" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Tests
        </Link>
        <h1 style={{ margin: 0 }}>Create New Test</h1>
        <p className="text-muted" style={{ marginTop: '8px' }}>Creating a test in {viewingUser.name}'s space.</p>
      </div>
      
      <TestCreator topics={topics} userId={viewingUser.id} currentUserId={currentUser.id} />
    </div>
  );
}
