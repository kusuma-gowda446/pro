import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { TaskItem, TaskForm } from "@/components/TaskComponents";
import { addRoadmapMilestone, createRoadmap } from "@/app/actions";
import { revalidatePath } from "next/cache";

export default async function DashboardPage() {
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE, MMMM d, yyyy").toUpperCase();
  
  const todayTasks = await prisma.task.findMany({
    where: { assignedToId: viewingUser.id, date: todayStr, status: "pending" },
    include: { assignedTo: true }
  });

  const currentlyDoingTasks = await prisma.task.findMany({
    where: { assignedToId: viewingUser.id, status: "in-progress" },
    include: { assignedTo: true }
  });
  
  const currentRoadmaps = await prisma.roadmap.findMany({
    where: { userId: viewingUser.id, status: "In Progress" },
    include: { items: { where: { status: "pending" }, take: 5 } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="page-turn-anim">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2rem', letterSpacing: '0.1em' }}>
          {displayDate}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary-brown)', marginTop: '8px' }}>
          <span className="font-handwriting">Hi {viewingUser.name}!</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
        
        {/* Left Column */}
        <div style={{ flex: '1 1 400px' }}>
          
          <section style={{ marginBottom: '50px' }}>
            <h3>CURRENTLY DOING</h3>
            <div style={{ marginTop: '10px' }}>
              {currentlyDoingTasks.map(task => (
                <TaskItem key={task.id} task={task} currentUserId={currentUser.id} />
              ))}
              {isOwner && (
                <TaskForm currentUserId={currentUser.id} friendUserId={viewingUser.id} date={todayStr} status="in-progress" />
              )}
              {currentlyDoingTasks.length === 0 && !isOwner && (
                <p className="font-handwriting text-muted lined-paper">Not actively working on anything right now.</p>
              )}
            </div>
          </section>

          <section style={{ marginBottom: '50px' }}>
            <h3>TODAY'S TASKS</h3>
            <div style={{ marginTop: '10px' }}>
              {todayTasks.map(task => (
                <TaskItem key={task.id} task={task} currentUserId={currentUser.id} />
              ))}
              {isOwner && (
                <TaskForm currentUserId={currentUser.id} friendUserId={viewingUser.id} date={todayStr} status="pending" />
              )}
              {todayTasks.length === 0 && !isOwner && (
                <p className="font-handwriting text-muted lined-paper">No tasks for today.</p>
              )}
            </div>
          </section>
        </div>
        
        {/* Right Column */}
        <div style={{ flex: '1 1 300px' }}>
          <section style={{ marginBottom: '50px' }}>
            <h3 style={{ marginBottom: '20px' }}>ROADMAPS</h3>
            
            <div className="flex-col" style={{ gap: '30px' }}>
              {currentRoadmaps.map(roadmap => (
                <div key={roadmap.id}>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-soft-brown)', marginBottom: '10px', color: 'var(--text-secondary-brown)' }}>
                    {roadmap.title.toUpperCase()}
                  </div>
                  
                  {roadmap.items.map((item: any) => (
                    <div key={item.id} className="checklist-item lined-paper">
                      <form action={async () => {
                        "use server";
                        await prisma.roadmapItem.update({ where: { id: item.id }, data: { status: "completed" } });
                        await prisma.activityLog.create({
                          data: { actionType: "MILESTONE_COMPLETED", details: `Completed roadmap milestone: ${item.title}`, userId: viewingUser.id }
                        });
                        revalidatePath("/");
                      }}>
                        <button type="submit" className="checklist-circle"></button>
                      </form>
                      <span className="task-text font-handwriting">{item.title}</span>
                    </div>
                  ))}
                  {roadmap.items.length === 0 && (
                    <p className="font-handwriting text-muted lined-paper">No pending milestones.</p>
                  )}
                  
                  {isOwner && (
                    <form action={async (formData) => {
                      "use server";
                      const title = formData.get("title") as string;
                      await addRoadmapMilestone(roadmap.id, title, viewingUser.id);
                    }} className="flex-row items-center lined-paper mt-2">
                      <div className="checklist-circle" style={{ border: '2px dashed var(--border-soft-brown)' }}></div>
                      <input 
                        type="text" 
                        name="title" 
                        placeholder="Add milestone..." 
                        className="font-handwriting"
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.4rem' }} 
                        required
                      />
                      <button type="submit" className="btn-secondary" style={{ padding: '2px 8px', fontSize: '1rem', fontFamily: 'var(--font-caveat)' }}>Add</button>
                    </form>
                  )}
                </div>
              ))}
              
              {currentRoadmaps.length === 0 && (
                <p className="font-handwriting text-muted lined-paper">No active roadmaps.</p>
              )}
              
              {isOwner && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed var(--border-soft-brown)' }}>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-secondary-brown)' }}>
                    + CREATE NEW ROADMAP
                  </div>
                  <form action={async (formData) => {
                    "use server";
                    const title = formData.get("title") as string;
                    await createRoadmap(viewingUser.id, title);
                  }} className="flex-row items-center lined-paper">
                    <input 
                      type="text" 
                      name="title" 
                      placeholder="Roadmap Title..." 
                      className="font-handwriting"
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.4rem' }} 
                      required
                    />
                    <button type="submit" className="btn-secondary" style={{ padding: '2px 8px', fontSize: '1rem', fontFamily: 'var(--font-caveat)' }}>Create</button>
                  </form>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
