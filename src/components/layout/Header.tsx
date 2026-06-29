import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <header className="w-full px-6 h-full flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white font-sans">
          Prep<span className="text-[var(--accent-secondary)]">Pilot</span>
        </span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link 
          to="/" 
          className={`text-[13px] font-medium tracking-wider transition-all duration-200 uppercase ${
            isActive('/') ? 'text-[#a78bfa] drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
          }`}
        >
          HOME
        </Link>
        {user && (
          <Link 
            to="/dashboard" 
            className={`text-[13px] font-medium tracking-wider transition-all duration-200 uppercase ${
              isActive('/dashboard') ? 'text-[#a78bfa] drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
            }`}
          >
            DASHBOARD
          </Link>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            {/* User avatar from Google */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-indigo-500/40 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm text-violet-400 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-slate-200 font-medium mr-2">
              {user.name.split(' ')[0]}
            </span>
            <button 
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`text-[13px] font-medium tracking-wider transition-all duration-200 uppercase ${
                isActive('/login') ? 'text-[#a78bfa] drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              LOGIN
            </Link>
            <Link 
              to="/signup" 
              className={`text-[13px] font-semibold px-4.5 py-2 rounded-lg transition-all duration-200 ${
                isActive('/signup') 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-transparent text-[#94a3b8] border border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              SIGN UP
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
