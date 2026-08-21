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

/**
 * Toasts sit at the TOP, centred.
 *
 * Centred rather than top-right on purpose: the notification panel and the account menu
 * both open from the top-right, and a toast landing there would cover the very panel that
 * triggered it (marking notifications read, for instance). Centring also keeps them clear
 * of the update banner, which is bottom-centred.
 *
 * `top: 76` clears the 64px sticky header, so a toast never hides the search bar or the
 * bell while the user is still working with them.
 */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 76,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
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
        // The tint is ~7% alpha. At the bottom it floated over empty page margin; at the
        // top it sits over tables and cards, so it needs an opaque base or the content
        // beneath shows through the alert.
        backgroundColor: C.surface,
        backgroundImage: `linear-gradient(${style.bg}, ${style.bg})`,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize: 14,
        fontWeight: 500,
        pointerEvents: 'auto',
        // `both` retains the END state. Without a fill mode the card reverts to the
        // keyframe's start once the animation finishes, leaving it stuck 10px high —
        // invisible when toasts sat at the bottom, a visible misalignment at the top.
        animation: isExiting ? 'avaFade 0.2s ease reverse both' : 'avaDrop 0.3s ease both',
        maxWidth: 320,
        boxShadow: '0 8px 24px rgba(16,24,40,.14), 0 2px 6px rgba(16,24,40,.08)',
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
