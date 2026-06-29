import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'borderless';
  className?: string;
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  const baseClasses = "relative rounded-2xl transition-all duration-300";
  
  const variantClasses = {
    default: "bg-[var(--bg-card)] border border-[var(--border-accent)] shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
    accent: "bg-[var(--bg-card)] border-2 border-[var(--accent-primary)]/40 shadow-[0_4px_30px_rgba(108,99,255,0.15)]",
    borderless: "bg-white/[0.01] border border-white/5"
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
