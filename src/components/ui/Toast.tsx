import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

export function Toast({ message, type = 'info', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'info':
      default:
        return '⚡';
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        background: "#1c1c28",
        border: "1px solid rgba(108,99,255,0.4)",
        borderRadius: "12px",
        padding: "16px 20px",
        color: "#f0f0f5",
        fontSize: "14px",
        zIndex: 1000,
      }}
      className="animate-fadeIn shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-auto"
    >
      <div className="flex items-center gap-2 font-medium font-sans">
        <span>{getIcon()}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
export default Toast;
