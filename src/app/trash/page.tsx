import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
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
  const { viewingUser } = await getViewingUser();
  
  const trashItems = await prisma.trashItem.findMany({
    where: { userId: viewingUser.id },
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
          History of deleted items for {viewingUser.name}
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
              
              <div style={{ padding: '20px' }}>
                {groupedItems[dateStr].map(item => (
                  <div key={item.id} className="lined-paper" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', borderLeft: '3px solid var(--text-secondary-brown)' }}>
                    <div style={{ color: 'var(--text-tertiary)' }} title={item.itemType}>
                      {getIconForType(item.itemType)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{item.itemTitle}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        {item.itemType} • Deleted at {format(new Date(item.deletedAt), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
