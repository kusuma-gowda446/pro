import { getViewingUser, getFriendUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskItem, TaskForm } from "@/components/TaskComponents";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const { viewingUser, currentUser } = await getViewingUser();
  const friendUser = await getFriendUser(viewingUser.id);
  
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const myTasks = await prisma.task.findMany({
    where: { assignedToId: viewingUser.id },
    include: { assignedTo: true, assignedBy: true },
    orderBy: { createdAt: 'desc' }
  });

  const myPendingTasks = myTasks.filter(t => t.status !== "completed");
  const myCompletedTasks = myTasks.filter(t => t.status === "completed");

  let friendTasks: any[] = [];
  if (friendUser) {
    friendTasks = await prisma.task.findMany({
      where: { assignedToId: friendUser.id, assignedById: viewingUser.id },
      include: { assignedTo: true, assignedBy: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  const friendPendingTasks = friendTasks.filter(t => t.status !== "completed");
  const friendCompletedTasks = friendTasks.filter(t => t.status === "completed");

  return (
    <div className="page-turn-anim" style={{ paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>
          TASKS
        </h2>
        <div style={{ color: 'var(--text-secondary-brown)', marginTop: '8px' }} className="font-handwriting">
          Assign and track tasks between Buddy and Kiddo
        </div>
      </div>

      <div className="responsive-grid">
        
        {/* Left Column: My Tasks */}
        <div className="responsive-col">
          <section style={{ marginBottom: '50px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-soft-brown)', paddingBottom: '10px' }}>
              TASKS FOR ME
            </h3>
            
            <div style={{ marginTop: '10px' }}>
              <div style={{ marginBottom: '20px' }}>
                <TaskForm 
                  currentUserId={currentUser.id} 
                  friendUserId={friendUser?.id || currentUser.id} 
                  date={todayStr} 
                  status="pending" 
                  defaultAssigneeId={currentUser.id}
                />
              </div>

              {myPendingTasks.map(task => (
                <TaskItem key={task.id} task={task} currentUserId={currentUser.id} />
              ))}
              
              {myPendingTasks.length === 0 && (
                <p className="font-handwriting text-muted lined-paper">No pending tasks for me.</p>
              )}

              {myCompletedTasks.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem', color: 'var(--text-secondary-brown)', marginBottom: '10px' }}>Completed</h4>
                  {myCompletedTasks.map(task => (
                    <TaskItem key={task.id} task={task} currentUserId={currentUser.id} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        
        {/* Right Column: Friend's Tasks */}
        {friendUser && (
          <div className="responsive-col">
            <section style={{ marginBottom: '50px' }}>
              <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-soft-brown)', paddingBottom: '10px' }}>
                TASKS FOR {friendUser.name.toUpperCase()}
              </h3>
              
              <div style={{ marginTop: '10px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <TaskForm 
                    currentUserId={currentUser.id} 
                    friendUserId={friendUser.id} 
                    date={todayStr} 
                    status="pending" 
                    defaultAssigneeId={friendUser.id}
                  />
                </div>

                {friendPendingTasks.map(task => (
                  <TaskItem key={task.id} task={task} currentUserId={currentUser.id} />
                ))}
                
                {friendPendingTasks.length === 0 && (
                  <p className="font-handwriting text-muted lined-paper">No pending tasks assigned to {friendUser.name}.</p>
                )}

                {friendCompletedTasks.length > 0 && (
                  <div style={{ marginTop: '30px' }}>
                    <h4 style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem', color: 'var(--text-secondary-brown)', marginBottom: '10px' }}>Completed</h4>
                    {friendCompletedTasks.map(task => (
                      <TaskItem key={task.id} task={task} currentUserId={currentUser.id} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
