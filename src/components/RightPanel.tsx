import React, { useState } from 'react';
import { useCalendarStorage } from '../hooks/useCalendarStorage';
import { useToast } from './Toast';
import { EventModal } from './EventModal';
import { useHolidays } from '../hooks/useHolidays';
import './RightPanel.css';

interface RightPanelProps {
  selectedDate: string | null;
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ selectedDate, onClose }) => {
  // Destructure (Removed unused Daily Todo functions)
  const { 
      getDayData, 
      addMood, 
      removeMood, 
      deleteEvent
  } = useCalendarStorage();
  
  const { showToast } = useToast();
  
  // Real-time Holiday
  const dateObjForHook = selectedDate ? new Date(selectedDate) : new Date();
  const { getHoliday } = useHolidays(dateObjForHook);
  const holidayName = selectedDate ? getHoliday(new Date(selectedDate)) : null;

  // Modal State
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  
  // Local Input States

  const [showAllMoods, setShowAllMoods] = useState(false);

  if (!selectedDate) {
    return (
        <div className="right-panel empty-state">
            <h3>날짜를 선택하세요</h3>
            <p className="sub-text">캘린더에서 날짜를 클릭하여 상세 정보를 확인하세요.</p>
        </div>
    );
  }

  const dayData = getDayData(selectedDate);
  const dateObj = new Date(selectedDate);
  const formattedDate = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(dateObj);
  
  // Color logic for header
  const isSunday = dateObj.getDay() === 0;
  const isSaturday = dateObj.getDay() === 6;
  const dateColor = (isSunday || holidayName) ? '#FF3B30' : isSaturday ? '#007AFF' : 'inherit';

  const handleAddMood = (mood: string) => {
      addMood(selectedDate, mood);
      showToast('기분이 기록되었습니다!', 'success');
  };



  return (
    <>
    <div className="right-panel">
      <header className="panel-header">
        <div>
            <h2 className="panel-date" style={{color: dateColor, backgroundImage: 'none', WebkitTextFillColor: dateColor}}>
                {dateObj.getDate()}
            </h2>
            <div style={{display:'flex', flexDirection:'column'}}>
                <span className="panel-weekday">{formattedDate}</span>
                {holidayName && <span className="holiday-badge" style={{color: '#FF3B30', fontWeight:700, fontSize:'0.9rem', marginTop:'4px'}}>🇰🇷 {holidayName}</span>}
            </div>
        </div>
        <button onClick={onClose} className="close-panel-btn">×</button>
      </header>
      
      <div className="panel-content scrollable">
        
        {/* 1. Mood Section (Moved up) */}
        <section className="panel-section">
            <h4>오늘의 기분 (Mood)</h4>
            <div className="mood-display-area">
                {dayData.moods.length === 0 && <span className="placeholder-text">오늘의 기분을 기록해보세요.</span>}
                {dayData.moods.map((mood, i) => (
                    <span key={i} className="mood-jumbo glass-card" onClick={() => removeMood(selectedDate, i)}>
                        {mood}
                    </span>
                ))}
            </div>
            
            {/* Mood Picker (Categorized) */}
            {dayData.moods.length < 2 && (
                <div className="mood-picker-container glass-inset">
                    {!showAllMoods ? (
                        /* Simple View: Top 5 + More Button */
                        <div className="emoji-slider">
                            {['👍', '🔥', '❤️', '✔️', '😊'].map(m => (
                                <button key={m} onClick={() => handleAddMood(m)} className="emoji-slide-item">{m}</button>
                            ))}
                            <button className="emoji-slide-item more-btn" onClick={() => setShowAllMoods(true)}>+</button>
                        </div>
                    ) : (
                        /* Expanded Categorized View */
                        <div className="emoji-expanded">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                                <span className="picker-label">이모지 선택</span>
                                <button className="close-picker-btn" onClick={() => setShowAllMoods(false)}>닫기</button>
                            </div>
                            
                            <div className="picker-category">
                                <label>긍정 & 에너지</label>
                                <div className="emoji-grid">
                                    {['👍', '🔥', '❤️', '🥰', '🥳', '😎', '💪', '✨'].map(m => (
                                        <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                                    ))}
                                </div>
                            </div>
                             <div className="picker-category">
                                <label>차분 & 휴식</label>
                                <div className="emoji-grid">
                                    {['😊', '😌', '☕️', '🛌', '🧘', '🧸', '📚', '☁️'].map(m => (
                                        <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="picker-category">
                                <label>부정 & 피곤</label>
                                <div className="emoji-grid">
                                    {['😢', '😡', '🤬', '🤯', '😱', '🤒', '🤕', '💤'].map(m => (
                                        <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                                    ))}
                                </div>
                            </div>
                             <div className="picker-category">
                                <label>작업 & 완료</label>
                                <div className="emoji-grid">
                                    {['✔️', '✅', '💻', '📝', '📈', '📅', '🚫', '⚠️'].map(m => (
                                        <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>

        {/* 3. Schedule Section (Read-Only + Add Button) */}
        <section className="panel-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                <h4 style={{margin:0}}>일정 (Schedule)</h4>
                
                {/* Liquid Glass Add Button */}
                <button className="liquid-add-btn" onClick={() => setEventModalOpen(true)}>
                    + 일정 추가
                </button>
            </div>
            
            <div className="event-list">
                {dayData.events.length === 0 ? (
                    <div className="no-events glass-inset" onClick={() => setEventModalOpen(true)} style={{cursor: 'pointer'}}>
                        <p>등록된 일정이 없습니다.</p>
                    </div>
                ) : (
                    dayData.events.map(e => (
                        <div key={e.id} className="event-item glass-card-small">
                            <div className="event-info">
                                <span className={`event-time-badge ${e.isAllDay ? 'all-day' : ''}`}>
                                    {e.isAllDay ? '종일' : e.time}
                                </span>
                                <div style={{display:'flex', flexDirection: 'column'}}>
                                    <span className="event-title">{e.title}</span>
                                    {e.description && <span className="event-desc-small">{e.description}</span>}
                                </div>
                            </div>
                            <button className="delete-event-btn" onClick={() => deleteEvent(selectedDate, e.id!)}>×</button>
                        </div>
                    ))
                )}
            </div>
        </section>
      </div>
    </div>

    {/* Center Popup Modal */}
    <EventModal 
        isOpen={isEventModalOpen} 
        onClose={() => setEventModalOpen(false)} 
        selectedDate={selectedDate}
    />
    </>
  );
};
