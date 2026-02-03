import { generateCalendarGrid, getMonthYearDetails, getZodiacAnimal, getSeasonStyle } from '../utils/dateUtils';
import { useCalendarStorage } from '../hooks/useCalendarStorage';
import { useHolidays } from '../hooks/useHolidays'; // Real-time holidays
import { GlassHeader } from './GlassHeader';
import './Calendar.css';
import { CalendarEvent } from '../types';

const WEEKS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS_SHORT = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

interface CalendarProps {
  currentDate: Date;
  viewMode: 'month' | 'year';
  selectedDate: string | null;
  onDateClick: (dateString: string) => void;
  onMonthNav: (direction: 'prev' | 'next') => void;
  onYearNav: (direction: 'prev' | 'next') => void;
  onViewChange: (view: 'month' | 'year') => void;
  onMonthSelect: (monthIndex: number) => void;
  googleEvents?: CalendarEvent[];
}

export default function Calendar({ 
    currentDate, 
    viewMode, 
    selectedDate,
    onDateClick, 
    onMonthNav, 
    onYearNav,
    onViewChange,
    onMonthSelect,
    googleEvents = []
}: CalendarProps) {
  
  const { getDayData } = useCalendarStorage();
  // Fetch real-time holidays
  const { getHoliday } = useHolidays(currentDate);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { year } = getMonthYearDetails(currentDate);
  const zodiac = getZodiacAnimal(year);
  
  // Custom KR formatting for title
  const monthTitle = `${currentDate.getMonth() + 1}월`;
  
  const grid = generateCalendarGrid(currentDate);

  return (
    <div className="calendar-container">
      {/* Top Header Widget */}
      <GlassHeader />

      <div className="glass-panel main-calendar">
        {/* Header */}
        <header className="calendar-header">
          {viewMode === 'month' ? (
              <div className="month-display">
                <button onClick={() => onMonthNav('prev')} className="nav-btn">‹</button>
                    <div className="title-group" onClick={() => onViewChange('year')} style={{cursor: 'pointer'}}>
                        <h2>{monthTitle}</h2>
                        {/* Detailed Zodiac for current year context */}
                        <span className="year-sub" style={{color: '#86868b'}}>{year}년 {zodiac.korYear} • {zodiac.desc}</span>
                    </div>
                <button onClick={() => onMonthNav('next')} className="nav-btn">›</button>
              </div>
          ) : (
              <div className="month-display year-view-header">
                  <button onClick={() => onYearNav('prev')} className="nav-btn">‹</button>
                  <div className="title-group">
                    <h2>{year}년</h2>
                    <span className="year-sub" style={{fontSize: '14px', fontWeight:500, color: 'var(--text-primary)'}}>
                        {zodiac.korYear} ({zodiac.desc}) {zodiac.emoji}
                    </span>
                  </div>
                  <button onClick={() => onYearNav('next')} className="nav-btn">›</button>
              </div>
          )}
        </header>

        {viewMode === 'month' ? (
            <div className="calendar-grid">
            {WEEKS.map((day, i) => (
                <div key={day} className={`week-header ${i === 6 ? 'saturday-text' : ''} ${i === 0 ? 'holiday-text' : ''}`}>
                    {day}
                </div>
            ))}

            {grid.map((cell, idx) => {
                const dayData = getDayData(cell.dateString);
                const todos = dayData.todos || [];
                const localEvents = dayData.events || [];
                
                // Merge Local + Google Events
                const dayGoogleEvents = googleEvents.filter(e => e.date === cell.dateString);
                const events = [...localEvents, ...dayGoogleEvents].sort((a, b) => {
                    const timeA = a.time || '24:00';
                    const timeB = b.time || '24:00';
                    return timeA.localeCompare(timeB);
                });

                const holiday = getHoliday(cell.date);
                
                const todoCount = todos.filter(t => t.completed).length;
                const dateObj = cell.date;
                const isSunday = dateObj.getDay() === 0;
                const isSaturday = dateObj.getDay() === 6;
                // Determine text color class
                const dayClass = isSunday || holiday ? 'holiday-text' : isSaturday ? 'saturday-text' : '';

                const availableEventSlots = todoCount > 0 ? 2 : 3;
                let displayEvents = events;
                let showOverflow = false;
                
                if (events.length > availableEventSlots) {
                    displayEvents = events.slice(0, availableEventSlots - 1); 
                    showOverflow = true;
                }
                
                return (
                <div 
                    key={`${cell.dateString}-${idx}`} 
                    className={`day-cell ${!cell.isCurrentMonth ? 'faded' : ''} ${cell.isToday ? 'today' : ''} ${selectedDate === cell.dateString ? 'selected' : ''}`}
                    onClick={() => onDateClick(cell.dateString)}
                >
                    {/* Header */}
                    <div className="day-header-row">
                        <div className="date-group">
                            <span className={`day-number ${dayClass}`}>
                                {dateObj.getDate()}
                            </span>
                            {holiday && <span className="holiday-label">{holiday}</span>}
                        </div>
                        
                        <div className="mood-dots-right">
                            {dayData.moods.map((mood, i) => (
                                <span key={i} className="mini-mood">{mood}</span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Content Stack */}
                    <div className="cell-content-stack">
                        {todoCount > 0 && (
                            <div className="todo-summary-text">
                                ✓ 완료 {todoCount}
                            </div>
                        )}
                        
                        {displayEvents.map(e => (
                             <div key={e.id} className="event-row-compact">
                                <span className="event-time-mini">{e.isAllDay ? '종일' : e.time}</span>
                                <span className="event-title-mini">{e.title}</span>
                             </div>
                        ))}
                        
                        {showOverflow && (
                            <div className="plan-overflow-compact">
                                일정 {events.length}+
                            </div>
                        )}
                    </div>
                    
                    {cell.isToday && <div className="today-glow" />}
                </div>
                );
            })}
            </div>
        ) : (
            // Year View Grid with Premium Seasons (Minimal)
            <div className="year-grid">
                {MONTHS_SHORT.map((m, i) => {
                   const isCurrentMonth = new Date().getMonth() === i && new Date().getFullYear() === year;
                   const season = getSeasonStyle(i);
                   
                   return (
                       <div 
                        key={m} 
                        className={`month-card ${isCurrentMonth ? 'current-month' : ''}`} 
                        onClick={() => onMonthSelect(i)}
                        style={{
                            background: season.gradient,
                            border: `1px solid ${season.border}`,
                            position: 'relative',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: season.text,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                            transition: 'transform 0.2s',
                            height: '100%'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                       >
                           <span className="month-name">{m}</span>
                           <span className="season-icon" style={{
                               position: 'absolute',
                               bottom: '12px',
                               right: '12px',
                               fontSize: '20px',
                               opacity: 0.6,
                               filter: 'grayscale(0.4)'
                           }}>{season.icon}</span>
                       </div>
                   );  
                })}
            </div>
        )}
      </div>
    </div>
  );
}
