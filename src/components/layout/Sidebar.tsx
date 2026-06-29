import React, { useState } from 'react';
import { PlusCircle, Settings as SettingsIcon } from 'lucide-react';
import { PrepTask } from '../../types/plan';
import { useAuthContext } from '../../context/AuthContext';
import SettingsModal from './SettingsModal';

interface SidebarProps {
  tasks: PrepTask[];
  activeTaskId: string | null;
  isCreatingNew: boolean;
  onSelectTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onNewTask: () => void;
  isOpen: boolean; // for mobile toggle
}

export function getDeadlineEmoji(type: string): string {
  const map: Record<string, string> = {
    interview: '💼',
    exam: '📚',
    presentation: '🎤',
    project: '🛠️',
    certification: '🏆',
    competition: '⚔️',
    other: '🎯',
  };
  return map[type] || '🎯';
}

function formatDate(iso: any): string {
  if (!iso) return '';
  let date: Date;
  if (typeof iso === 'object' && iso.seconds !== undefined) {
    date = new Date(iso.seconds * 1000);
  } else {
    date = new Date(iso);
  }
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Sidebar({
  tasks,
  activeTaskId,
  isCreatingNew,
  onSelectTask,
  onDeleteTask,
  onNewTask,
  isOpen,
}: SidebarProps) {
  const { user } = useAuthContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ─── Sidebar outer container ──────────────────────────────────────────────
  // On desktop: position:fixed to the left, full height below header (76px).
  // On mobile:  position:fixed off-screen left, slides in when isOpen=true.
  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: '64px',
    left: 0,
    bottom: 0,
    width: '260px',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#07070a',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    transition: 'transform 0.25s ease',
  };

  // Mobile: slide in/out from the left
  const mobileSidebarStyle: React.CSSProperties = {
    ...sidebarStyle,
    // On mobile screens (<768px) we use transform; overridden on md+ via media query
  };

  return (
    <>
      {/* ── SIDEBAR PANEL ─────────────────────────────────────────────── */}
      <div
        className={`sidebar-container${isOpen ? ' open' : ''}`}
        style={sidebarStyle}
      >
        {/* Inner flex layout: top, scrollable middle, fixed bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '8px' }}>

          {/* ── TOP: New Strategy button ──────────────────────────────── */}
          <div style={{ flexShrink: 0 }}>
            {!isCreatingNew && (
              <button
                onClick={onNewTask}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: '12px',
                  color: '#a78bfa',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginBottom: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
              >
                <PlusCircle size={16} />
                New Strategy
              </button>
            )}

            {isCreatingNew && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                marginBottom: '4px',
              }}>
                <div style={{ fontSize: '13px', color: '#a78bfa', fontStyle: 'italic' }}>
                  ✏️ New Strategy...
                </div>
              </div>
            )}

            {tasks.length > 0 && (
              <div style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#475569',
                textTransform: 'uppercase',
                marginTop: '8px',
                paddingLeft: '4px',
                marginBottom: '4px',
              }}>
                RECENT STRATEGIES
              </div>
            )}
          </div>

          {/* ── MIDDLE: Scrollable task list ─────────────────────────────── */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const isActive = task.id === activeTaskId && !isCreatingNew;
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="task-item group"
                    style={{
                      position: 'relative',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: isActive
                        ? '1px solid rgba(99,102,241,0.35)'
                        : '1px solid transparent',
                      background: isActive
                        ? 'rgba(99,102,241,0.12)'
                        : 'transparent',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{getDeadlineEmoji(task.deadlineType)}</span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#e2e8f0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '170px',
                          lineHeight: '1.3',
                        }}>
                          {task.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteTask(task.id); }}
                      className="task-delete-btn"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        opacity: 0,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            ) : (
              !isCreatingNew && (
                <div style={{ padding: '32px 8px', textAlign: 'center', color: '#475569', fontSize: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                  <div>No strategies yet.</div>
                  <div>Create your first one →</div>
                </div>
              )
            )}
          </div>

          {/* ── BOTTOM: User profile + Settings — FIXED at bottom, never scrolls ─ */}
          <div style={{
            flexShrink: 0,
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {user ? (
              /* Logged-in: avatar + name + settings gear (like ChatGPT/Antigravity) */
              <button
                onClick={() => setIsSettingsOpen(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                title="Open Settings"
              >
                {/* Avatar */}
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(99,102,241,0.2)', color: '#a78bfa',
                    border: '1px solid rgba(99,102,241,0.2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '10px', fontFamily: 'monospace', flexShrink: 0,
                  }}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Name / tier */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#475569', fontWeight: 500, marginTop: '2px' }}>
                    Free Account
                  </div>
                </div>
                {/* Settings gear icon */}
                <SettingsIcon size={15} style={{ color: '#64748b', flexShrink: 0 }} />
              </button>
            ) : (
              /* Not logged in: plain settings button */
              <button
                onClick={() => setIsSettingsOpen(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                <SettingsIcon size={14} />
                Settings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SETTINGS MODAL ────────────────────────────────────────────────── */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
