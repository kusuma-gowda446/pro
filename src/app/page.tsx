import { getCurrentUser, getPartnerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { TaskItem, TaskForm } from "@/components/TaskComponents";
import { PriorityForm, ReminderForm } from "@/components/OtherComponents";
import { DailyReportForm } from "@/components/ReportComponents";

export default async function DailyPage() {
  const currentUser = await getCurrentUser();
  const partnerUser = await getPartnerUser(currentUser.id);
  
  if (!partnerUser) return <div>Partner user not found. Did you run the seed script?</div>;
  
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE, MMMM d, yyyy").toUpperCase();
  
  // Ensure daily page exists
  await prisma.dailyPage.upsert({
    where: { date: todayStr },
    update: {},
    create: { date: todayStr }
  });
  
  const tasks = await prisma.task.findMany({
    where: { date: todayStr },
    include: { assignedTo: true }
  });
  
  const priorities = await prisma.priority.findMany({
    where: { date: todayStr }
  });
  
  const reminders = await prisma.reminder.findMany({
    where: { status: "active" }
  });
  
  const currentUserReport = await prisma.dailyReport.findUnique({
    where: { date_userId: { date: todayStr, userId: currentUser.id } }
  });
  
  const partnerUserReport = await prisma.dailyReport.findUnique({
    where: { date_userId: { date: todayStr, userId: partnerUser.id } }
  });

  return (
    <div className="page-turn-anim">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: '2rem', letterSpacing: '0.1em' }}>
          {displayDate}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary-brown)', marginTop: '8px' }}>
          <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.2rem' }}>Hi {currentUser.name}!</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Left Column */}
        <div style={{ flex: '1 1 500px' }}>
          <section style={{ marginBottom: '40px' }}>
            <h3>TODAY</h3>
            <div style={{ marginTop: '20px' }}>
              {tasks.map(task => (
                <TaskItem key={task.id} task={task} currentUserId={currentUser.id} />
              ))}
              <TaskForm currentUserId={currentUser.id} partnerUserId={partnerUser.id} date={todayStr} />
            </div>
          </section>
          
          <section style={{ marginBottom: '40px' }}>
            <h3>DON'T FORGET</h3>
            <div style={{ marginTop: '20px' }}>
              {reminders.map(rem => (
                <div key={rem.id} className="checklist-item lined-paper">
                  <div className="checklist-circle"></div>
                  <span className="task-text" style={{ fontFamily: 'var(--font-caveat)' }}>{rem.content}</span>
                </div>
              ))}
              <ReminderForm />
            </div>
          </section>
        </div>
        
        {/* Right Column */}
        <div style={{ flex: '1 1 300px' }}>
          <section style={{ marginBottom: '40px', backgroundColor: 'rgba(118, 85, 65, 0.05)', padding: '20px', borderRadius: '8px' }}>
            <h3>TOP PRIORITIES</h3>
            <div style={{ marginTop: '10px' }}>
              {priorities.map((p, i) => (
                <div key={p.id} className="flex-row items-center mt-2">
                  <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem', fontWeight: 'bold' }}>{i + 1}.</span>
                  <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '1.25rem' }}>{p.content}</span>
                </div>
              ))}
              <PriorityForm currentUserId={currentUser.id} date={todayStr} />
            </div>
          </section>
          
          <section style={{ marginBottom: '40px' }}>
            <h3>FOR TOMORROW</h3>
            <div style={{ marginTop: '20px' }}>
              <TaskForm currentUserId={currentUser.id} partnerUserId={partnerUser.id} date="tomorrow" />
            </div>
          </section>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div style={{ marginTop: '60px' }}>
        <section style={{ marginBottom: '60px' }}>
          <h3>DAILY REPORT</h3>
          <div className="flex-row" style={{ gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <DailyReportForm 
                userId={currentUser.id} 
                date={todayStr} 
                existingReport={currentUserReport} 
                isOwner={true} 
                name={currentUser.name} 
              />
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <DailyReportForm 
                userId={partnerUser.id} 
                date={todayStr} 
                existingReport={partnerUserReport} 
                isOwner={false} 
                name={partnerUser.name} 
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
