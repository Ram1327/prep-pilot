import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'adapted' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  const baseClasses = "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans transition-all";
  
  const variantClasses = {
    default: "bg-white/10 text-[var(--text-primary)] border border-white/5",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/10",
    danger: "bg-red-500/20 text-red-400 border border-red-500/10",
    warning: "bg-amber-500/20 text-amber-500 border border-amber-500/10",
    adapted: "bg-purple-600 text-white border border-purple-500/20 shadow-sm shadow-purple-500/10",
    outline: "border border-white/15 text-[var(--text-secondary)] bg-transparent"
  };

  return (
    <span 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
export default Badge;
