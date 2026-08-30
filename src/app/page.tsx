import { getViewingUser, getFriendUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { TaskItem, TaskForm } from "@/components/TaskComponents";
import { addRoadmapMilestone, createRoadmap } from "@/app/actions";
import { revalidatePath } from "next/cache";

import { RoadmapSelector } from "@/components/RoadmapSelector";

export default async function DashboardPage(props: { searchParams: Promise<{ roadmapId?: string }> }) {
  const searchParams = await props.searchParams;
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  const friendUser = await getFriendUser(currentUser.id);
  
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
    include: { items: { where: { status: "pending" } } },
    orderBy: { createdAt: 'desc' }
  });

  const selectedRoadmapId = searchParams.roadmapId || (currentRoadmaps.length > 0 ? currentRoadmaps[0].id : undefined);
  const selectedRoadmap = currentRoadmaps.find(r => r.id === selectedRoadmapId);

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
      
      <div className="responsive-grid">
        
        {/* Left Column */}
        <div className="responsive-col">
          <section style={{ marginBottom: '50px' }}>
            <h3>TODAY'S TASKS</h3>
            <div style={{ marginTop: '10px' }}>
              {todayTasks.map(task => (
                <TaskItem key={task.id} task={task} currentUserId={currentUser.id} isOwner={isOwner} />
              ))}
              <TaskForm 
                currentUserId={currentUser.id} 
                friendUserId={friendUser?.id || currentUser.id} 
                currentUserName={currentUser.name}
                friendUserName={viewingUser.name}
                date={todayStr} 
                status="pending" 
                defaultAssigneeId={viewingUser.id}
                hideAssigneeDropdown={true}
              />

              {todayTasks.length === 0 && (
                <p className="font-handwriting text-muted lined-paper">No tasks for today.</p>
              )}
            </div>
          </section>
        </div>
        
        {/* Right Column */}
        <div className="responsive-col">
          <section style={{ marginBottom: '50px' }}>
            <h3 style={{ marginBottom: '20px' }}>ROADMAPS</h3>
            
            <div className="flex-col" style={{ gap: '20px' }}>
              <RoadmapSelector 
                roadmaps={currentRoadmaps.map(r => ({ id: r.id, title: r.title }))} 
                currentRoadmapId={selectedRoadmapId} 
              />
              
              {selectedRoadmap && (
                <div key={selectedRoadmap.id}>
                  {selectedRoadmap.items.map((item: any) => (
                    <div key={item.id} className="checklist-item lined-paper" style={{ opacity: item.status === "completed" ? 0.6 : 1 }}>
                      {item.status === "pending" ? (
                        isOwner ? (
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
                        ) : (
                          <div className="checklist-circle"></div>
                        )
                      ) : (
                        <div className="checklist-circle" style={{ backgroundColor: 'var(--text-dark-brown)', border: 'none' }}></div>
                      )}
                      <span className="task-text font-handwriting" style={{ textDecoration: item.status === "completed" ? 'line-through' : 'none' }}>{item.title}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {currentRoadmaps.length === 0 && (
                <p className="font-handwriting text-muted lined-paper">No active roadmaps.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
