import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export default async function ActivityPage() {
  const { viewingUser } = await getViewingUser();
  
  const activities = await prisma.activityLog.findMany({
    where: { userId: viewingUser.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ padding: '0 24px 24px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>⏱️ Activity Timeline</h1>
      
      <div className="card">
        <div className="flex-col" style={{ gap: '0' }}>
          {activities.map((act, idx) => (
            <div key={act.id} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: idx < activities.length - 1 ? '1px solid var(--border-color)' : 'none', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-color)', zIndex: 1, marginTop: '6px' }} />
                {idx < activities.length - 1 && <div style={{ position: 'absolute', top: '30px', bottom: '-20px', left: '5px', width: '2px', background: 'var(--border-color)' }} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '4px' }}>{act.details}</div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {format(new Date(act.createdAt), "MMMM d, yyyy 'at' h:mm a")} • {act.actionType.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && <p className="text-muted text-center" style={{ padding: '40px' }}>No activity found.</p>}
        </div>
      </div>
    </div>
  );
}
