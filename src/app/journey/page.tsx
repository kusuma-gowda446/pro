import { prisma } from "@/lib/db";
import { format } from "date-fns";

export default async function JourneyPage() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
    take: 100 // limit to last 100 for now
  });

  // Group by date
  const groupedActivities: Record<string, typeof activities> = {};
  activities.forEach(activity => {
    const dateStr = format(activity.createdAt, "MMMM d, yyyy");
    if (!groupedActivities[dateStr]) groupedActivities[dateStr] = [];
    groupedActivities[dateStr].push(activity);
  });

  const getIconForAction = (actionType: string) => {
    if (actionType.includes("COMPLETED")) return "✓";
    if (actionType.includes("CREATED")) return "📝";
    if (actionType.includes("ASSIGNED")) return "📌";
    if (actionType.includes("MILESTONE")) return "🚀";
    if (actionType.includes("ACHIEVEMENT") || actionType.includes("STREAK")) return "⭐";
    return "•";
  };

  return (
    <div className="page-turn-anim" style={{ padding: '20px' }}>
      <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>
        OUR JOURNEY
      </h2>
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {Object.entries(groupedActivities).length === 0 && (
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-caveat)', fontSize: '1.5rem', color: 'var(--text-secondary-brown)' }}>
            The journey begins today...
          </p>
        )}
        
        {Object.entries(groupedActivities).map(([date, logs]) => (
          <div key={date} style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary-brown)' }}>{date}</h3>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{getIconForAction(log.actionType)}</span>
                  <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.5rem' }}>
                    <strong>{log.user.name}</strong> {log.details.toLowerCase()}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary-brown)' }}>
                    {format(log.createdAt, "h:mm a")}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', borderBottom: '1px dashed var(--border-soft-brown)', opacity: 0.5 }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
