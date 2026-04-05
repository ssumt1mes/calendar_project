import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { useCalendarStorage } from '../hooks/useCalendarStorage';
import { useToast } from './Toast';
import './EventModal.css';

import { Portal } from './Portal';
import { GlassTimePicker } from './GlassTimePicker';
import { CalendarEvent } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  editingEvent?: CalendarEvent | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  editingEvent = null,
}) => {
  const { addEvent, updateEvent } = useCalendarStorage();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initialTime = editingEvent?.time ?? '09:00';
    const [initialHour, initialMinute] = initialTime.split(':');
    setTitle(editingEvent?.title ?? '');
    setDesc(editingEvent?.description ?? '');
    setIsAllDay(Boolean(editingEvent?.isAllDay));
    setHour(initialHour ?? '09');
    setMinute(initialMinute ?? '00');
  }, [isOpen, editingEvent]);

  if (!isOpen) return null;

  const handleTimeChange = (h: string, m: string) => {
      setHour(h);
      setMinute(m);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const timeString = isAllDay ? undefined : `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    if (editingEvent?.id) {
      updateEvent(selectedDate, editingEvent.id, {
        title,
        description: desc,
        time: timeString,
        isAllDay,
      });
      showToast('일정이 수정되었습니다.', 'success');
    } else {
      addEvent(selectedDate, {
        title,
        description: desc,
        time: timeString,
        isAllDay,
      });
      showToast('일정이 성공적으로 추가되었습니다!', 'success');
    }

    // Reset & Close
    setTitle('');
    setDesc('');
    setHour('12');
    setMinute('00');
    setIsAllDay(false);
    onClose();
  };

  return (
    <Portal>
        <Modal isOpen={isOpen} onClose={onClose} title={editingEvent ? '일정 수정' : '새로운 일정 추가'}>
        <div className="event-form-container">
            
            {/* Title */}
            <div className="form-group">
            <label htmlFor="event-title-input">제목</label>
            <input 
                id="event-title-input"
                type="text" 
                className="glass-input big-input"
                placeholder="일정 제목을 입력하세요"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
            />
            </div>

            {/* Time Selection */}
            <div className="form-group">
            <label>시간 설정</label>
            <div className="time-section-wrapper">
                <label className="checkbox-label glass-checkbox-modal">
                    <input 
                        type="checkbox" 
                        checked={isAllDay} 
                        onChange={(e) => setIsAllDay(e.target.checked)} 
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">하루 종일 (All Day)</span>
                </label>

                {!isAllDay && (
                    <GlassTimePicker 
                        hour={hour} 
                        minute={minute} 
                        onTimeChange={handleTimeChange} 
                    />
                )}
            </div>
            </div>

            {/* Description */}
            <div className="form-group">
            <label htmlFor="event-description-input">세부 내용</label>
            <textarea 
                id="event-description-input"
                className="glass-input area-input"
                placeholder="메모나 세부 사항을 적어주세요..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
            />
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
             <button className="cancel-btn" onClick={onClose}>취소</button>
             <button className="submit-btn" onClick={handleSubmit} disabled={!title}>
                {editingEvent ? '수정 저장' : '일정 등록하기'}
             </button>
            </div>
        </div>
        </Modal>
    </Portal>
  );
};
