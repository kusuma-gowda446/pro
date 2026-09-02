import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskItem, TaskForm } from "@/components/TaskComponents";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const myTasks = await prisma.task.findMany({
    where: { 
      userId: viewingUser.id,
      OR: [
        { category: null },
        { category: { not: "dashboard" } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  const myPendingTasks = myTasks.filter(t => t.status !== "completed");
  const myCompletedTasks = myTasks.filter(t => t.status === "completed");



  return (
    <div className="page-turn-anim" style={{ paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>
          TASKS
        </h2>
        <div style={{ color: 'var(--text-secondary-brown)', marginTop: '8px' }} className="font-handwriting">
          Manage your tasks and to-dos
        </div>
      </div>

      <div className="tasks-grid">
        
        {/* Left Column: My Tasks */}
        <div className="responsive-col">
          <section style={{ marginBottom: '50px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-soft-brown)', paddingBottom: '10px' }}>
              TASKS FOR {currentUser.name.toUpperCase()}
            </h3>
            
            <div style={{ marginTop: '10px' }}>
              <div style={{ marginBottom: '20px' }}>
                <TaskForm 
                  currentUserId={currentUser.id} 
                  date={todayStr} 
                  status="pending" 
                />
              </div>
              {myPendingTasks.map(task => (
                <TaskItem key={task.id} task={task} currentUserId={currentUser.id} isOwner={isOwner} />
              ))}
              
              {myPendingTasks.length === 0 && (
                <p className="font-handwriting text-muted lined-paper">No pending tasks for me.</p>
              )}

              {myCompletedTasks.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ fontFamily: 'var(--font-lora)', fontSize: '1rem', color: 'var(--text-secondary-brown)', marginBottom: '10px' }}>Completed</h4>
                  {myCompletedTasks.map(task => (
                    <TaskItem key={task.id} task={task} currentUserId={currentUser.id} isOwner={isOwner} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        
      </div>
    </div>
  );
}
