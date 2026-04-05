import React, { useState, useEffect } from 'react';
import './GlassHeader.css';

export const GlassHeader: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const dayNumber = time.getDate();
  const shortWeekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(time);
  const monthLabel = new Intl.DateTimeFormat('ko-KR', { month: 'long' }).format(time);
  const yearLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric' }).format(time);

  return (
    <div className="glass-header-widget">
      <div className="header-hero">
        <div className="header-hero-topline">
          <span className="header-kicker">shared calendar</span>
          <span className="header-pill">오늘 흐름</span>
        </div>

        <div className="header-info">
          <p className="header-date">{formatDate(time)}</p>
          <h1 className="header-time">{formatTime(time)}</h1>
        </div>

        <div className="header-summary-row">
          <div className="header-summary-chip">
            <span className="header-summary-label">이번 달</span>
            <strong>{monthLabel}</strong>
          </div>
          <div className="header-summary-chip">
            <span className="header-summary-label">포커스</span>
            <strong>해야 할 일과 일정 정리</strong>
          </div>
        </div>
      </div>

      <div className="header-metrics" aria-label="today summary">
        <div className="metric-card emphasis">
          <span className="metric-label">DAY</span>
          <strong>{dayNumber}</strong>
          <span className="metric-copy">{shortWeekday}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">MONTH</span>
          <strong>{monthLabel}</strong>
          <span className="metric-copy">월간 보기 중심</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">YEAR</span>
          <strong>{yearLabel}</strong>
          <span className="metric-copy">기록은 차분하게</span>
        </div>
      </div>
    </div>
  );
};
