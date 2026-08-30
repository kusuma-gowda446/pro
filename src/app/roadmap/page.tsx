import { getViewingUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addRoadmapMilestone, createRoadmap, deleteRoadmap, deleteRoadmapMilestone } from "@/app/actions";
import { revalidatePath } from "next/cache";
import { RoadmapAccordionItem } from "@/components/RoadmapAccordionItem";
import { DeleteButton } from "@/components/DeleteButton";

export default async function RoadmapPage() {
  const { viewingUser, currentUser, isOwner } = await getViewingUser();
  
  const allRoadmaps = await prisma.roadmap.findMany({
    where: { userId: viewingUser.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="page-turn-anim" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>
          ROADMAPS
        </h2>
        <div style={{ color: 'var(--text-secondary-brown)', marginTop: '8px' }} className="font-handwriting">
          Long-term goals and milestones for {viewingUser.name}
        </div>
      </div>

      {isOwner && (
        <section style={{ marginBottom: '50px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text-dark-brown)' }}>
            + CREATE NEW ROADMAP
          </div>
          <form action={async (formData) => {
            "use server";
            const title = formData.get("title") as string;
            await createRoadmap(viewingUser.id, title);
            revalidatePath("/roadmap");
          }} className="flex-row items-center lined-paper">
            <input 
              type="text" 
              name="title" 
              placeholder="Enter a new roadmap title..." 
              className="font-handwriting"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.4rem' }} 
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: '1.1rem', fontFamily: 'var(--font-caveat)' }}>Create</button>
          </form>
        </section>
      )}

      <div className="flex-col" style={{ gap: '40px' }}>
        {allRoadmaps.map(roadmap => {
          const completedItems = roadmap.items.filter((i: any) => i.status === "completed").length;
          const totalItems = roadmap.items.length;
          const progressStr = totalItems > 0 ? `${completedItems}/${totalItems} completed` : "No milestones yet";

          return (
            <RoadmapAccordionItem 
              key={roadmap.id} 
              roadmap={{ title: roadmap.title }} 
              progressStr={progressStr}
              onDelete={isOwner ? deleteRoadmap.bind(null, roadmap.id, viewingUser.id) : undefined}
            >
              <div className="flex-col" style={{ gap: '10px' }}>
                {roadmap.items.map((item: any) => (
                  <div key={item.id} className="checklist-item lined-paper" style={{ opacity: item.status === "completed" ? 0.6 : 1 }}>
                    {item.status === "pending" ? (
                      isOwner ? (
                        <form action={async () => {
                          "use server";
                          await prisma.roadmapItem.update({ where: { id: item.id }, data: { status: "completed" } });
                          await prisma.activityLog.create({
                            data: { actionType: "MILESTONE_COMPLETED", details: `Completed roadmap milestone: ${item.title}`, userId: viewingUser.id }
                          });
                          revalidatePath("/roadmap");
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
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="task-text font-handwriting" style={{ textDecoration: item.status === "completed" ? 'line-through' : 'none' }}>
                        {item.title}
                      </span>
                      {isOwner && (
                        <DeleteButton 
                          onDelete={deleteRoadmapMilestone.bind(null, item.id, viewingUser.id)}
                          title="Delete Milestone"
                          confirmMessage={`Are you sure you want to delete the milestone '${item.title}'?`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isOwner && roadmap.status === "In Progress" && (
                <form action={async (formData) => {
                  "use server";
                  const title = formData.get("title") as string;
                  await addRoadmapMilestone(roadmap.id, title, viewingUser.id);
                  revalidatePath("/roadmap");
                  revalidatePath("/");
                }} className="flex-row items-center lined-paper mt-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="checklist-circle" style={{ border: '2px dashed var(--border-soft-brown)', marginTop: '4px' }}></div>
                  <textarea 
                    name="title" 
                    placeholder="Add milestone... (paste multiple lines to add in bulk)" 
                    className="font-handwriting"
                    rows={1}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.3rem', resize: 'vertical', minHeight: '32px' }} 
                    required
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '2px 12px', fontSize: '1.1rem', fontFamily: 'var(--font-caveat)' }}>Add</button>
                </form>
              )}
            </RoadmapAccordionItem>
          );
        })}

        {allRoadmaps.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }} className="font-handwriting text-muted">
            <p style={{ fontSize: '1.5rem' }}>No roadmaps created yet.</p>
            <p>Start planning your journey above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
