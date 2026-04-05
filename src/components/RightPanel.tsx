import React, { useState } from 'react';
import { useCalendarStorage } from '../hooks/useCalendarStorage';
import { useToast } from './Toast';
import { EventModal } from './EventModal';
import { useHolidays } from '../hooks/useHolidays';
import { CalendarEvent } from '../types';
import { formatAbsoluteTimestamp, formatRelativeTimestamp } from '../utils/presentation';
import './RightPanel.css';

interface RightPanelProps {
  selectedDate: string | null;
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ selectedDate, onClose }) => {
  const {
    getDayData,
    addMood,
    removeMood,
    deleteEvent,
    calendarProfile,
    syncState,
  } = useCalendarStorage();

  const { showToast } = useToast();

  const dateObjForHook = selectedDate ? new Date(selectedDate) : new Date();
  const { getHoliday } = useHolidays(dateObjForHook);
  const holidayName = selectedDate ? getHoliday(new Date(selectedDate)) : null;

  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showAllMoods, setShowAllMoods] = useState(false);

  if (!selectedDate) {
    return (
      <div className="right-panel empty-state">
        <div className="panel-empty-card">
          <span className="panel-empty-kicker">선택된 날짜</span>
          <h3>날짜를 선택하세요</h3>
          <p className="sub-text">캘린더에서 날짜를 눌러 일정과 기분을 확인하세요.</p>
        </div>
      </div>
    );
  }

  const dayData = getDayData(selectedDate);
  const dateObj = new Date(selectedDate);
  const formattedDate = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(dateObj);

  const isSunday = dateObj.getDay() === 0;
  const isSaturday = dateObj.getDay() === 6;
  const dateColor = (isSunday || holidayName) ? '#FF3B30' : isSaturday ? '#007AFF' : 'inherit';

  const handleAddMood = (mood: string) => {
    addMood(selectedDate, mood);
    showToast('기분이 기록되었습니다!', 'success');
  };

  const syncCopy = syncState.error
    ? syncState.error
    : syncState.isSaving
      ? '변경사항을 저장 중입니다.'
      : calendarProfile.syncHealth === 'remote-active'
        ? '공유 캘린더 기준으로 원격 동기화 가능한 상태입니다.'
        : '로컬 저장 기반으로 동작하며, 구조는 원격 공유 전환에 맞춰 준비되어 있습니다.';

  return (
    <>
      <div className="right-panel">
        <div className="panel-sheet-handle" aria-hidden="true" />
        <header className="panel-header">
          <div className="panel-title-block">
            <h2 className="panel-date" style={{ color: dateColor, backgroundImage: 'none', WebkitTextFillColor: dateColor }}>
              {dateObj.getDate()}
            </h2>
            <div className="panel-title-copy">
              <span className="panel-weekday">{formattedDate}</span>
              {holidayName && <span className="holiday-badge">대한민국 공휴일 · {holidayName}</span>}
            </div>
          </div>
          <button onClick={onClose} className="close-panel-btn">×</button>
        </header>

        <div className="panel-content scrollable">
          <section className="panel-section">
            <div className={`panel-sync-card ${syncState.error ? 'error' : syncState.isSaving ? 'saving' : ''}`}>
              <div className="panel-sync-row">
                <span className="panel-sync-pill">{calendarProfile.syncHealth === 'remote-active' ? '공유 준비' : '로컬 저장'}</span>
                <span className="panel-sync-time">{formatRelativeTimestamp(syncState.lastSavedAt ?? dayData.updatedAt)}</span>
              </div>
              <strong>Todo 체크 상태와 일정 변경 이력이 함께 보존됩니다.</strong>
              <p>{syncCopy}</p>
              <span className="panel-sync-caption">최근 반영: {formatAbsoluteTimestamp(syncState.lastSavedAt ?? dayData.updatedAt)}</span>
            </div>
          </section>

          <section className="panel-section">
            <div className="panel-section-heading">
              <h4>오늘의 기분</h4>
              <span className="panel-section-caption">하루 분위기를 짧게 남겨두세요.</span>
            </div>
            <div className="mood-display-area">
              {dayData.moods.length === 0 && <span className="placeholder-text">오늘의 기분을 기록해보세요.</span>}
              {dayData.moods.map((mood, i) => (
                <span key={i} className="mood-jumbo glass-card" onClick={() => removeMood(selectedDate, i)}>
                  {mood}
                </span>
              ))}
            </div>

            {dayData.moods.length < 2 && (
              <div className="mood-picker-container glass-inset">
                {!showAllMoods ? (
                  <div className="emoji-slider">
                    {['👍', '🔥', '❤️', '✔️', '😊'].map((m) => (
                      <button key={m} onClick={() => handleAddMood(m)} className="emoji-slide-item">{m}</button>
                    ))}
                    <button className="emoji-slide-item more-btn" onClick={() => setShowAllMoods(true)}>+</button>
                  </div>
                ) : (
                  <div className="emoji-expanded">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="picker-label">이모지 선택</span>
                      <button className="close-picker-btn" onClick={() => setShowAllMoods(false)}>닫기</button>
                    </div>

                    <div className="picker-category">
                      <label>긍정 & 에너지</label>
                      <div className="emoji-grid">
                        {['👍', '🔥', '❤️', '🥰', '🥳', '😎', '💪', '✨'].map((m) => (
                          <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                        ))}
                      </div>
                    </div>
                    <div className="picker-category">
                      <label>차분 & 휴식</label>
                      <div className="emoji-grid">
                        {['😊', '😌', '☕️', '🛌', '🧘', '🧸', '📚', '☁️'].map((m) => (
                          <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                        ))}
                      </div>
                    </div>
                    <div className="picker-category">
                      <label>부정 & 피곤</label>
                      <div className="emoji-grid">
                        {['😢', '😡', '🤬', '🤯', '😱', '🤒', '🤕', '💤'].map((m) => (
                          <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                        ))}
                      </div>
                    </div>
                    <div className="picker-category">
                      <label>작업 & 완료</label>
                      <div className="emoji-grid">
                        {['✔️', '✅', '💻', '📝', '📈', '📅', '🚫', '⚠️'].map((m) => (
                          <button key={m} onClick={() => { handleAddMood(m); setShowAllMoods(false); }} className="emoji-item">{m}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="panel-section">
            <div className="panel-section-heading schedule-heading">
              <div>
                <h4>일정</h4>
                <span className="panel-section-caption">오늘 일정과 메모를 한곳에서 관리합니다.</span>
              </div>
              <button
                aria-label="일정 추가"
                className="liquid-add-btn"
                onClick={() => {
                  setEditingEvent(null);
                  setEventModalOpen(true);
                }}
              >
                + 일정 추가
              </button>
            </div>

            <div className="event-list">
              {dayData.events.length === 0 ? (
                <div
                  className="no-events glass-inset"
                  onClick={() => {
                    setEditingEvent(null);
                    setEventModalOpen(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <p>등록된 일정이 없습니다.</p>
                  <span>탭해서 첫 일정을 추가하세요.</span>
                </div>
              ) : (
                dayData.events.map((e) => (
                  <div key={e.id} className="event-item glass-card-small">
                    <div className="event-info">
                      <span className={`event-time-badge ${e.isAllDay ? 'all-day' : ''}`}>
                        {e.isAllDay ? '종일' : e.time}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span className="event-title">{e.title}</span>
                        {e.description && <span className="event-desc-small">{e.description}</span>}
                        <span className="event-meta-small">마지막 변경 {formatRelativeTimestamp(e.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="event-actions-inline">
                      <button
                        aria-label={`일정 수정 ${e.title}`}
                        className="edit-event-btn"
                        onClick={() => {
                          setEditingEvent(e);
                          setEventModalOpen(true);
                        }}
                      >
                        수정
                      </button>
                      <button
                        aria-label={`일정 삭제 ${e.title}`}
                        className="delete-event-btn"
                        onClick={() => deleteEvent(selectedDate, e.id!)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />
    </>
  );
};
