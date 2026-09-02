import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format, differenceInDays } from "date-fns";
import { Trash2, FileText, CheckCircle, Map, Layout, HelpCircle } from "lucide-react";

function getIconForType(type: string) {
  switch (type) {
    case 'Task': return <CheckCircle size={16} />;
    case 'Note': return <FileText size={16} />;
    case 'Roadmap': return <Map size={16} />;
    case 'Milestone': return <Layout size={16} />;
    case 'Test': return <HelpCircle size={16} />;
    default: return <Trash2 size={16} />;
  }
}

export default async function TrashPage() {
  const { viewingUser, currentUser } = await getViewingUser();
  
  // Cleanup items older than 15 days
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  
  await prisma.trashItem.deleteMany({
    where: {
      deletedAt: {
        lt: fifteenDaysAgo
      }
    }
  });
  
  const trashItems = await prisma.trashItem.findMany({
    where: { 
      OR: [
        { userId: viewingUser.id },
        { userId: currentUser.id }
      ]
    },
    orderBy: { deletedAt: 'desc' }
  });

  // Group by date
  const groupedItems: Record<string, typeof trashItems> = {};
  
  trashItems.forEach(item => {
    const dateStr = format(new Date(item.deletedAt), 'MMMM d, yyyy');
    if (!groupedItems[dateStr]) {
      groupedItems[dateStr] = [];
    }
    groupedItems[dateStr].push(item);
  });

  return (
    <div className="page-turn-anim" style={{ paddingBottom: '100px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>
          TRASH
        </h2>
        <div style={{ color: 'var(--text-secondary-brown)', marginTop: '8px' }} className="font-handwriting">
          History of deleted items for {viewingUser.id === currentUser.id ? viewingUser.name : `${currentUser.name} & ${viewingUser.name}`}
          <br />
          <span style={{ fontSize: '0.85em', opacity: 0.8 }}>Items are permanently deleted after 15 days.</span>
        </div>
      </div>

      <div className="flex-col" style={{ gap: '20px' }}>
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center text-muted lined-paper font-handwriting" style={{ padding: '40px 0' }}>
            The trash is empty!
          </div>
        ) : (
          Object.keys(groupedItems).map(dateStr => (
            <details key={dateStr} className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }} open>
              <summary style={{ padding: '16px 20px', backgroundColor: 'rgba(118, 85, 65, 0.05)', listStyle: 'none', fontWeight: 'bold', borderBottom: '1px solid var(--border-soft-brown)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-handwriting" style={{ fontSize: '1.25rem' }}>{dateStr}</span>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>{groupedItems[dateStr].length} items</span>
              </summary>
              
              <div style={{ padding: '20px' }} className="lined-paper">
                {groupedItems[dateStr].map(item => {
                  const daysLeft = Math.max(0, 15 - differenceInDays(new Date(), new Date(item.deletedAt)));
                  return (
                    <div key={item.id} style={{ 
                      padding: '12px 16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      marginBottom: '12px', 
                      borderLeft: '3px solid var(--text-secondary-brown)',
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      borderRadius: '0 8px 8px 0',
                      lineHeight: '1.2'
                    }}>
                      <div style={{ color: 'var(--text-secondary-brown)' }} title={item.itemType}>
                        {getIconForType(item.itemType)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-dark-brown)', fontSize: '1.2rem' }}>{item.itemTitle}</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.itemType} • Deleted at {format(new Date(item.deletedAt), 'h:mm a')}</span>
                          <span style={{ color: daysLeft <= 3 ? '#d97706' : 'inherit' }}>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
