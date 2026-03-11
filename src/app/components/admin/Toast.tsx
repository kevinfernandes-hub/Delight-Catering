'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 9999
      }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            style={{
              minWidth: '300px',
              padding: '1rem',
              backgroundColor: '#111',
              border: `1px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`,
              borderRadius: '0.75rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
              animation: 'slide-in 0.3s ease-out'
            }}
          >
            {toast.type === 'success' && <CheckCircle color="#10b981" size={20} />}
            {toast.type === 'error' && <AlertCircle color="#ef4444" size={20} />}
            {toast.type === 'info' && <Info color="#3b82f6" size={20} />}
            
            <span style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
