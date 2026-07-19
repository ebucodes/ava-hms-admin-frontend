import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { C } from '../../theme/tokens.js';

export const ToastContext = React.createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ id, message, type, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  const typeStyles = {
    success: {
      bg: C.emerald + '12',
      border: C.emerald,
      text: C.emerald,
      icon: CheckCircle2,
    },
    error: {
      bg: C.red + '12',
      border: C.red,
      text: C.red,
      icon: AlertCircle,
    },
    info: {
      bg: C.blue + '12',
      border: C.blue,
      text: C.blue,
      icon: AlertCircle,
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  const Icon = style.icon;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove();
    }, 200);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 10,
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize: 14,
        fontWeight: 500,
        pointerEvents: 'auto',
        animation: isExiting ? 'avaFade 0.2s ease reverse' : 'avaRise 0.3s ease',
        maxWidth: 320,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Icon size={18} />
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'inherit',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
