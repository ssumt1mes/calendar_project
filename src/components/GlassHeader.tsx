import React, { useState, useEffect } from 'react';
import './GlassHeader.css';

export const GlassHeader: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
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
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  return (
    <div className="glass-header-widget">
      <div className="header-info">
        <h1 className="header-time">{formatTime(time)}</h1>
        <p className="header-date">{formatDate(time)}</p>
      </div>
      
      <div className="header-weather glass-card-mini">
        <span className="weather-icon">🌤️</span>
        <div className="weather-text">
            <span className="weather-temp">24°</span>
            <span className="weather-desc">서울, 맑음</span>
        </div>
        <div className="weather-divider"></div>
        <div className="weather-text">
             <span className="weather-dust-label">미세먼지</span>
             <span className="weather-dust-value good">좋음 (32)</span>
        </div>
      </div>
    </div>
  );
};
