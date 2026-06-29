import React from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuthContext();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(2,2,8,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#12121a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={16} style={{ color: '#a78bfa' }} />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>System Settings</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Profile */}
          {user && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontFamily: 'monospace',
                  marginBottom: '8px',
                }}
              >
                Profile
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(99,102,241,0.2)',
                      color: '#a78bfa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{user.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{user.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Model Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
              }}
            >
              Model Configuration
            </div>
            <div
              style={{
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Primary Agent Model</div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>High-speed reasoning engine</div>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(99,102,241,0.1)',
                  color: '#a78bfa',
                  border: '1px solid rgba(99,102,241,0.2)',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  fontSize: '10px',
                }}
              >
                gemini-3.1-flash-lite
              </span>
            </div>
            <div
              style={{
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Fallback Agent Model</div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>High-stability recovery engine</div>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  fontSize: '10px',
                }}
              >
                gemini-2.5-flash
              </span>
            </div>
          </div>

          {/* App Status */}
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {[
              { label: 'System Version', value: 'v3.0.0', color: '#e2e8f0' },
              { label: 'Deployment Port', value: '3005', color: '#e2e8f0' },
              { label: 'Firebase DB Status', value: 'CONNECTED', color: '#10b981' },
            ].map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                }}
              >
                <span style={{ color: '#64748b' }}>{row.label}</span>
                <span style={{ color: row.color, fontFamily: 'monospace', fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              background: '#4f46e5',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6366f1')}
            onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
