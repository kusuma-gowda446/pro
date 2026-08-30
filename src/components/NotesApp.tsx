"use client";

import { useState, useTransition } from "react";
import { createNote, updateNote, deleteNote, addAttachment } from "@/app/actions/notes";
import { FileText, Star, Archive, Pin, Search, Plus, Paperclip, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function NotesApp({ initialNotes, userId, isOwner, currentUserId }: any) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState(notes[0]?.id || null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, pinned, favorites
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  
  const filteredNotes = notes.filter((n: any) => {
    if (search && !n.title?.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "pinned" && !n.pinned) return false;
    if (filter === "favorites" && !n.favorite) return false;
    if (filter === "archived") return n.archived;
    return !n.archived;
  });
  
  const selectedNote = notes.find((n: any) => n.id === selectedNoteId) || null;

  const handleCreate = () => {
    startTransition(async () => {
      const newNote = await createNote(userId, currentUserId);
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
    });
  };
  
  const handleUpdate = (id: string, data: any) => {
    setNotes(notes.map((n: any) => n.id === id ? { ...n, ...data, updatedAt: new Date() } : n));
    startTransition(async () => {
      await updateNote(id, data, currentUserId);
    });
  };
  
  const handleDelete = (id: string) => {
    setNotes(notes.filter((n: any) => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
    startTransition(async () => {
      await deleteNote(id, currentUserId);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !selectedNote) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.success) {
        startTransition(async () => {
          const attachment = await addAttachment(selectedNote.id, {
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            fileUrl: data.url
          });
          
          setNotes(notes.map((n: any) => {
            if (n.id === selectedNote.id) {
              return { ...n, attachments: [...(n.attachments || []), attachment] };
            }
            return n;
          }));
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="notes-app-container">
        {/* Sidebar */}
        <div className="notes-app-sidebar">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary-brown)' }} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', background: 'var(--bg-card)' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className={`btn-secondary ${filter === 'all' ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: '0.8rem', background: filter === 'all' ? 'var(--bg-card)' : 'transparent' }} onClick={() => setFilter('all')}>All</button>
            <button className={`btn-secondary ${filter === 'pinned' ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: '0.8rem', background: filter === 'pinned' ? 'var(--bg-card)' : 'transparent' }} onClick={() => setFilter('pinned')}>Pinned</button>
            <button className={`btn-secondary ${filter === 'favorites' ? 'active' : ''}`} style={{ padding: '4px 8px', fontSize: '0.8rem', background: filter === 'favorites' ? 'var(--bg-card)' : 'transparent' }} onClick={() => setFilter('favorites')}>Favs</button>
            {isOwner && (
              <button onClick={handleCreate} className="btn-primary" style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}>
                <Plus size={14} /> New
              </button>
            )}
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredNotes.map((note: any) => (
            <div 
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              style={{ 
                padding: '16px', 
                borderBottom: '1px solid var(--border-color)', 
                cursor: 'pointer',
                background: selectedNoteId === note.id ? 'var(--bg-card)' : 'transparent',
                borderLeft: selectedNoteId === note.id ? '3px solid var(--accent-color)' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.title || 'Untitled Note'}
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {note.pinned && <Pin size={12} color="var(--accent-color)" />}
                  {note.favorite && <Star size={12} color="#FFD700" fill="#FFD700" />}
                  {isOwner && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this note?')) {
                          handleDelete(note.id);
                        }
                      }}
                      title="Delete Note"
                    >
                      <Trash2 size={14} color="var(--text-secondary-brown)" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                {note.content.substring(0, 50) || 'No content...'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {format(new Date(note.updatedAt), "MMM d, h:mm a")}
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary-brown)' }}>No notes found.</div>
          )}
        </div>
      </div>
      
      {/* Editor Main */}
      <div className="notes-app-main">
        {selectedNote ? (
          <>
            <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                {format(new Date(selectedNote.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
              {isOwner && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleUpdate(selectedNote.id, { pinned: !selectedNote.pinned })} title="Pin">
                    <Pin size={18} color={selectedNote.pinned ? "var(--text-dark-brown)" : "var(--text-secondary-brown)"} />
                  </button>
                  <button onClick={() => handleUpdate(selectedNote.id, { favorite: !selectedNote.favorite })} title="Favorite">
                    <Star size={18} color={selectedNote.favorite ? "#FFD700" : "var(--text-secondary-brown)"} fill={selectedNote.favorite ? "#FFD700" : "none"} />
                  </button>
                  <button onClick={() => handleUpdate(selectedNote.id, { archived: !selectedNote.archived })} title="Archive">
                    <Archive size={18} color={selectedNote.archived ? "var(--text-dark-brown)" : "var(--text-secondary-brown)"} />
                  </button>
                  <button onClick={() => {
                    if (confirm('Are you sure you want to delete this note?')) {
                      handleDelete(selectedNote.id);
                    }
                  }} title="Delete" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary-brown)', fontSize: '0.9rem' }}>
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
              <input 
                type="text" 
                value={selectedNote.title || ''}
                onChange={e => handleUpdate(selectedNote.id, { title: e.target.value })}
                placeholder="Note Title"
                disabled={!isOwner}
                style={{ fontSize: '2rem', fontWeight: 'bold', border: 'none', background: 'none', padding: 0, marginBottom: '24px', color: 'var(--text-primary)' }}
              />
              <textarea
                value={selectedNote.content || ''}
                onChange={e => handleUpdate(selectedNote.id, { content: e.target.value })}
                placeholder="Start typing..."
                disabled={!isOwner}
                style={{ width: '100%', minHeight: '300px', border: 'none', background: 'none', resize: 'none', fontSize: '1.1rem', padding: 0, lineHeight: 1.6, color: 'var(--text-primary)' }}
              />
              
              {/* Attachments Section */}
              <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Attachments</h3>
                  {isOwner && (
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: '500' }}>
                      <Paperclip size={16} /> Add File
                      <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  )}
                </div>
                
                {isUploading && <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Uploading...</div>}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {selectedNote.attachments?.map((att: any) => (
                    <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
                      <FileText size={24} color="var(--text-secondary-brown)" />
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.9rem' }}>{att.fileName}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{(att.fileSize / 1024).toFixed(1)} KB • {att.fileType || 'Unknown'}</div>
                      </div>
                    </a>
                  ))}
                  {(!selectedNote.attachments || selectedNote.attachments.length === 0) && (
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>No attachments.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary-brown)' }}>
            Select a note to view or create a new one.
          </div>
        )}
      </div>
    </div>
  );
}
