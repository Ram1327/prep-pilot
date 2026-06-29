import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import { AuthProvider, useAuthContext } from "./context/AuthContext";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { authLoading } = useAuthContext();
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div className="animate-pulse" style={{ fontSize: 32 }}>✦</div>
        <div style={{ fontSize: 14, color: '#5a5a72', fontFamily: "monospace" }}>Loading PrepPilot...</div>
      </div>
    );
  }
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuthContext();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Pages that show the sidebar get a left padding on desktop */
function useSidebarOffset() {
  const { user } = useAuthContext();
  const location = useLocation();
  const noSidebarPaths = ['/login', '/signup'];
  const isNoSidebar = noSidebarPaths.includes(location.pathname);
  if (isNoSidebar) return false;

  // If user is logged in, they always have a sidebar on home and dashboard pages
  if (user) return true;

  // If guest on home page and has shared_plan query parameter, the sidebar is shown
  if (location.pathname === '/') {
    const params = new URLSearchParams(location.search);
    return params.has('shared_plan');
  }

  return false;
}

function AppLayout() {
  const hasSidebar = useSidebarOffset();

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] bg-grid text-[var(--text-primary)] relative"
    >
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none z-0" />

      {/* ── FIXED HEADER ─────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '64px', zIndex: 100, background: '#07070a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Header />
      </div>

      {/* ── BODY (sidebar + main content sit side-by-side) ─────────────────── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', paddingTop: '64px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* Pages that include the Sidebar render it inside themselves.
              We need a spacer here on desktop so content doesn't go under the fixed sidebar. */}
          <div
            className="sidebar-spacer"
            style={{
              flexShrink: 0,
              width: hasSidebar ? '260px' : '0',
              transition: 'width 0.25s ease',
            }}
          />

          {/* Main scrollable content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthWrapper>
          <AppLayout />
        </AuthWrapper>
      </Router>
    </AuthProvider>
  );
}
