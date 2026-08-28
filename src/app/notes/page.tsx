import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotesApp } from "@/components/NotesApp";

export default async function NotesPage() {
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  
  const notes = await prisma.note.findMany({
    where: { userId: viewingUser.id },
    include: { attachments: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <NotesApp 
        initialNotes={notes} 
        userId={viewingUser.id} 
        isOwner={isOwner}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
