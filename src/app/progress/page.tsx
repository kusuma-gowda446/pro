import { prisma } from "@/lib/db";
import { getCurrentUser, getPartnerUser } from "@/lib/auth";

export default async function ProgressPage() {
  const currentUser = await getCurrentUser();
  const partnerUser = await getPartnerUser(currentUser.id);
  
  if (!partnerUser) return <div>No partner found.</div>;
  
  const buddy = currentUser.name === 'Buddy' ? currentUser : partnerUser;
  const kiddo = currentUser.name === 'Kiddo' ? currentUser : partnerUser;

  const buddyTasks = await prisma.task.count({ where: { assignedToId: buddy.id, status: 'completed' }});
  const kiddoTasks = await prisma.task.count({ where: { assignedToId: kiddo.id, status: 'completed' }});
  const totalTasks = await prisma.task.count({ where: { status: 'completed' }});

  const buddyReports = await prisma.dailyReport.count({ where: { userId: buddy.id }});
  const kiddoReports = await prisma.dailyReport.count({ where: { userId: kiddo.id }});
  const totalDays = await prisma.dailyPage.count();

  return (
    <div className="page-turn-anim" style={{ padding: '20px' }}>
      <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>
        PROGRESS
      </h2>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Buddy Stats */}
        <div style={{ flex: '1 1 250px', backgroundColor: 'rgba(118, 85, 65, 0.05)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-soft-brown)' }}>
          <h3 style={{ textAlign: 'center', borderBottom: 'none' }}>Buddy</h3>
          <div className="flex-col mt-4" style={{ gap: '15px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Tasks completed:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2rem' }}>{buddyTasks}</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Current streak:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2rem' }}>{buddy.streak} days 🔥</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Daily reports:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2rem' }}>{buddyReports}/{totalDays || 1}</div>
            </div>
          </div>
        </div>

        {/* Kiddo Stats */}
        <div style={{ flex: '1 1 250px', backgroundColor: 'rgba(118, 85, 65, 0.05)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-soft-brown)' }}>
          <h3 style={{ textAlign: 'center', borderBottom: 'none' }}>Kiddo</h3>
          <div className="flex-col mt-4" style={{ gap: '15px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Tasks completed:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2rem' }}>{kiddoTasks}</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Current streak:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2rem' }}>{kiddo.streak} days 🔥</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Daily reports:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2rem' }}>{kiddoReports}/{totalDays || 1}</div>
            </div>
          </div>
        </div>

        {/* Together Stats */}
        <div style={{ flex: '1 1 100%', maxWidth: '540px', backgroundColor: 'rgba(118, 85, 65, 0.1)', padding: '30px', borderRadius: '12px', border: '2px solid var(--text-secondary-brown)', marginTop: '20px' }}>
          <h3 style={{ textAlign: 'center', borderBottom: 'none' }}>TOGETHER</h3>
          <div className="flex-row justify-between mt-4 text-center">
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Total tasks:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2.5rem' }}>{totalTasks}</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Shared roadmap:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2.5rem' }}>0%</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 'bold' }}>Days tracked:</span>
              <div style={{ fontFamily: 'var(--font-caveat)', fontSize: '2.5rem' }}>{totalDays}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
