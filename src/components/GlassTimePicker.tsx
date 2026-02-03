import React, { useState } from 'react';
import './GlassTimePicker.css';

interface GlassTimePickerProps {
  hour: string;
  minute: string;
  onTimeChange: (h: string, m: string) => void;
}

export const GlassTimePicker: React.FC<GlassTimePickerProps> = ({ hour, minute, onTimeChange }) => {
  const [mode, setMode] = useState<'grid' | 'custom'>('grid');

  // Quick Presets
  const presets = [
    { label: '아침 🌞', h: '09', m: '00' },
    { label: '오후 ☀️', h: '13', m: '00' },
    { label: '저녁 🌙', h: '19', m: '00' },
    { label: '밤 💤', h: '22', m: '00' },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="glass-time-picker">
      <div className="picker-tabs">
        <button 
            className={`picker-tab ${mode === 'grid' ? 'active' : ''}`}
            onClick={() => setMode('grid')}
        >
            빠른 선택
        </button>
        <button 
            className={`picker-tab ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => setMode('custom')}
        >
            직접 입력
        </button>
      </div>

      {mode === 'grid' ? (
        <div className="preset-grid">
            {presets.map(p => (
                <button 
                    key={p.label} 
                    className={`preset-btn ${hour === p.h && minute === p.m ? 'selected' : ''}`}
                    onClick={() => onTimeChange(p.h, p.m)}
                >
                    <span className="preset-label">{p.label}</span>
                    <span className="preset-time">{p.h}:{p.m}</span>
                </button>
            ))}
             <button 
                className="preset-btn custom-link"
                onClick={() => setMode('custom')}
            >
                <span className="preset-label">상세 설정</span>
                <span className="preset-time">...</span>
            </button>
        </div>
      ) : (
        <div className="custom-picker">
            <div className="scroll-column">
                <label>시 (Hour)</label>
                <div className="scroll-options custom-scrollbar">
                    {hours.map(h => (
                        <div 
                            key={h} 
                            className={`time-option ${hour === h ? 'selected' : ''}`}
                            onClick={() => onTimeChange(h, minute)}
                        >
                            {h}
                        </div>
                    ))}
                </div>
            </div>
            <div className="time-divider">:</div>
            <div className="scroll-column">
                <label>분 (Min)</label>
                <div className="scroll-options custom-scrollbar">
                    {minutes.map(m => (
                        <div 
                            key={m} 
                            className={`time-option ${minute === m ? 'selected' : ''}`}
                            onClick={() => onTimeChange(hour, m)}
                        >
                            {m}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
      
      <div className="preview-time">
        선택된 시간: <strong>{hour}:{minute}</strong>
      </div>
    </div>
  );
};
