import React from 'react';
import { createPortal } from 'react-dom';

interface NotificationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
        style={{
            position: 'fixed',
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
    >
        <div 
            style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '24px',
                width: '320px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.6)',
                textAlign: 'center',
                transform: 'translateY(0)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}
            onClick={e => e.stopPropagation()}
        >
            <div style={{ fontSize: '3rem', marginBottom: '-10px' }}>🔔</div>
            
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1d1d1f' }}>{title}</h3>
            
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#86868b', lineHeight: '1.4' }}>
                {message}
            </p>

            <button 
                onClick={onClose}
                style={{
                    marginTop: '8px',
                    background: '#007AFF', // Apple Blue
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                    width: '100%'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                확인
            </button>
        </div>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
    </div>,
    document.body
  );
};
