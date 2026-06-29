import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Catch and silence benign unhandled websocket/HMR errors from DevTools / proxy connection drops
window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || String(event?.reason || '');
  if (
    msg.includes('WebSocket') || 
    msg.includes('websocket') || 
    msg.includes('closed without opened') ||
    msg.includes('connection failed')
  ) {
    event.stopPropagation();
    event.preventDefault();
    console.warn('Silenced expected HMR WebSocket rejection:', event.reason);
  }
});

window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  if (
    msg.includes('WebSocket') || 
    msg.includes('websocket') ||
    (event?.error && String(event.error).includes('WebSocket'))
  ) {
    event.stopPropagation();
    event.preventDefault();
    console.warn('Silenced expected HMR WebSocket error event:', event);
  }
}, true);

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error crashed app:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#07070a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '24px',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
          padding: '24px'
        }}>
          <div style={{ fontSize: '64px', filter: 'drop-shadow(0 0 15px rgba(99,102,241,0.3))' }}>✦</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>An unexpected error occurred</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '440px', lineHeight: 1.6 }}>
              PrepPilot encountered a critical runtime exception. Don't worry, your strategic execution data remains safely stored.
            </p>
          </div>
          {this.state.error && (
            <pre style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f87171',
              fontFamily: 'monospace',
              maxWidth: '600px',
              overflowX: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(to right, #6366f1, #a855f7)',
              borderRadius: '12px',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
              transition: 'opacity 0.2s ease-in-out'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Reload PrepPilot
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

