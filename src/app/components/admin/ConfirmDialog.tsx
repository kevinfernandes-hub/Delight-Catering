'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'gold';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmVariant = 'gold'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-dialog" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            backgroundColor: confirmVariant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(201, 168, 76, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: confirmVariant === 'danger' ? '#ef4444' : '#C9A84C'
          }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{title}</h3>
            <p style={{ margin: 0, color: '#A3A3A3', fontSize: '0.9rem', lineHeight: '1.5' }}>{message}</p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            onClick={onCancel}
            style={{ 
              background: '#1a1a1a', border: '1px solid #333', color: '#fff', 
              padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onCancel(); }}
            style={{ 
              background: confirmVariant === 'danger' ? '#ef4444' : '#C9A84C', 
              color: confirmVariant === 'danger' ? '#fff' : '#000', 
              border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', 
              fontWeight: 'bold', cursor: 'pointer' 
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          display: flex; align-items: center; justify-content: center; z-index: 2000;
          padding: 1.5rem;
        }
        .modal-content {
          background: #111; border: 1px solid #333; border-radius: 1rem;
          max-width: 450px; width: 100%; padding: 1.5rem;
        }
      `}</style>
    </div>
  );
}
