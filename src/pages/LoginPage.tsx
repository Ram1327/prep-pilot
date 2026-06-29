import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, resetPassword } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: any) {
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      navigate("/");
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Email/Password sign-in is not enabled. Please use Google sign-in.");
      } else {
        setError(err?.message || "Sign in failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email address above, then click Forgot Password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        setError("No account found for that email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Could not send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center py-10 px-4 font-sans animate-fadeIn">
      <div
        id="login-card"
        className="w-full max-w-[440px] p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]" />

        {/* Brand / Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider font-semibold text-[var(--accent-secondary)] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            SECURE ACCESS
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Welcome Back
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 px-2">
            Log in to access your customized execution roadmaps.
          </p>
        </div>

        {/* Password Reset Success State */}
        {resetSent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Reset email sent!</p>
              <p className="text-xs text-slate-400">
                Check your inbox at{" "}
                <span className="text-slate-200 font-medium">{email}</span> for a
                password reset link.
              </p>
            </div>
            <button
              onClick={() => setResetSent(false)}
              className="text-xs text-[var(--accent-secondary)] hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {/* Login Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="login-email"
                  className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="login-password"
                    className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="text-[10px] font-semibold text-[var(--accent-secondary)] hover:underline cursor-pointer disabled:opacity-50 bg-transparent border-none p-0"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Single inline error — no duplicate Toast */}
              {error && (
                <p className="text-[13px] text-red-400 text-center mt-1">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-semibold text-sm tracking-wide shadow-[0_4px_14px_rgba(108,99,255,0.25)] hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center justify-center gap-3">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                OR
              </span>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 mr-1"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4c0,-0.71 -0.07,-1.4 -0.19,-2.02Z" fill="#4285F4" />
                  <path d="M12,20.5c2.56,0 4.72,-0.85 6.3,-2.3l-3.3,-2.6c-0.92,0.62 -2.1,0.98 -3.3,0.98c-2.43,0 -4.5,-1.64 -5.23,-3.84h-3.41v2.64c1.6,3.19 4.9,5.12 8.44,5.12Z" fill="#34A853" />
                  <path d="M6.77,12.74c-0.19,-0.57 -0.3,-1.17 -0.3,-1.79c0,-0.62 0.11,-1.22 0.3,-1.79V6.5h-3.4c-0.64,1.28 -1,2.72 -1,4.24c0,1.52 0.36,2.96 1,4.24l3.4,-2.64Z" fill="#FBBC05" />
                  <path d="M12,5.38c1.39,0 2.64,0.48 3.62,1.42l2.7,-2.7C16.7,2.6 14.54,1.7 12,1.7C8.46,1.7 5.16,3.63 3.56,6.82l3.41,2.64C7.7,7.22 9.77,5.38 12,5.38Z" fill="#EA4335" />
                </g>
              </svg>
              Continue with Google
            </button>

            {/* Footer / switch */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[var(--accent-secondary)] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
