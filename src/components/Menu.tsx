import React, { useState } from 'react';
import { useCalendarStorage } from '../hooks/useCalendarStorage';
import { useToast } from './Toast';
import { formatDateString } from '../utils/dateUtils';
import './Menu.css';
import { GoogleConnectButton } from './GoogleConnectButton';
import { getCalendarStoreStatusLabel } from '../services/calendarStore';
import { formatAbsoluteTimestamp, formatRelativeTimestamp } from '../utils/presentation';

interface MenuProps {
  currentView: 'year' | 'month';
  onViewChange: (view: 'year' | 'month') => void;
  onToday: () => void;
  selectedDate: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onGoogleLogin: (token: string) => void;
  onGoogleLogout: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotification: () => void;
  onTestNotification: () => void;
}

export const Menu: React.FC<MenuProps> = ({
  currentView,
  onViewChange,
  onToday,
  selectedDate,
  userName,
  userEmail,
  onLogout,
  onGoogleLogin,
  onGoogleLogout,
  notificationPermission,
  onRequestNotification,
  onTestNotification,
}) => {
  const { getDayData, addDailyTodo, toggleDailyTodo, deleteDailyTodo, calendarProfile, syncState } = useCalendarStorage();
  const { showToast } = useToast();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalEndDate, setGoalEndDate] = useState('');
  const [newTodo, setNewTodo] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalEndDate) return;

    const start = new Date();
    const end = new Date(goalEndDate);

    const current = new Date(start);
    while (current <= end) {
      const dateStr = formatDateString(current);
      addDailyTodo(dateStr, `[목표] ${goalTitle}`);
      current.setDate(current.getDate() + 1);
    }

    setGoalTitle('');
    setGoalEndDate('');
    setShowGoalForm(false);
    showToast('목표가 설정되었습니다! 매일 할 일이 추가되었습니다.', 'success');
  };

  const dayData = getDayData(selectedDate);
  const todos = dayData.todos || [];
  const completedCount = todos.filter((todo) => todo.completed).length;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addDailyTodo(selectedDate, newTodo);
    setNewTodo('');
  };

  const formattedDate = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(selectedDate));

  const syncToneClass = syncState.error
    ? 'error'
    : syncState.isSaving
      ? 'saving'
      : calendarProfile.syncHealth === 'remote-active'
        ? 'healthy'
        : 'soft';

  const syncHeadline = syncState.error
    ? '저장 오류'
    : syncState.isSaving
      ? '동기화 중'
      : calendarProfile.syncHealth === 'remote-active'
        ? '2인 공유 준비 완료'
        : '로컬 준비 모드';

  const syncDescription = syncState.error
    ? syncState.error
    : calendarProfile.syncHealth === 'remote-active'
      ? 'Supabase에 저장되어 다른 기기/사용자와 상태를 맞출 수 있습니다.'
      : '현재는 기기 로컬에 저장되며, Supabase 연결 시 같은 구조로 원격 공유할 수 있습니다.';

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <div className="brand-lockup">
          <span className="brand-eyebrow">shared calendar</span>
          <h3>캘린더</h3>
          <p className="brand-subtitle">둘이 함께 쓰는 일정판을 깔끔하게 정리합니다.</p>
        </div>

        <div className="account-card">
          <strong>{userName}</strong>
          <span>{userEmail}</span>
          <span className="account-meta">
            {calendarProfile.name} · {getCalendarStoreStatusLabel(calendarProfile.syncHealth ?? 'local-only')}
          </span>
          <span className="account-meta account-meta-subtle">scope: {calendarProfile.slug}</span>
          <button type="button" className="account-logout" onClick={onLogout}>
            로그아웃
          </button>
        </div>

        <section className={`sync-card ${syncToneClass}`} aria-label="sync status">
          <div className="sync-card-topline">
            <span className="sync-dot" />
            <span className="sync-label">동기화 상태</span>
          </div>
          <strong>{syncHeadline}</strong>
          <p>{syncDescription}</p>
          <div className="sync-meta-grid">
            <div>
              <span className="sync-meta-label">마지막 반영</span>
              <span className="sync-meta-value">{formatRelativeTimestamp(syncState.lastSavedAt ?? dayData.updatedAt)}</span>
            </div>
            <div>
              <span className="sync-meta-label">저장 위치</span>
              <span className="sync-meta-value">{calendarProfile.syncHealth === 'remote-active' ? 'Remote + cache' : 'This device'}</span>
            </div>
          </div>
          <span className="sync-footnote">{formatAbsoluteTimestamp(syncState.lastSavedAt ?? dayData.updatedAt)}</span>
        </section>
      </div>

      <nav className="sidebar-nav">
        <button className={`sidebar-item ${currentView === 'year' ? 'active' : ''}`} onClick={() => onViewChange('year')}>
          <span className="sidebar-item-copy">
            <span className="sidebar-item-title">연간 보기</span>
            <span className="sidebar-item-subtitle">한 해 흐름 보기</span>
          </span>
        </button>
        <button className={`sidebar-item ${currentView === 'month' ? 'active' : ''}`} onClick={() => onViewChange('month')}>
          <span className="sidebar-item-copy">
            <span className="sidebar-item-title">월간 보기</span>
            <span className="sidebar-item-subtitle">하루 단위 일정 관리</span>
          </span>
        </button>
        <button className="sidebar-item" onClick={onToday}>
          <span className="sidebar-item-copy">
            <span className="sidebar-item-title">오늘로 이동</span>
            <span className="sidebar-item-subtitle">지금 날짜로 바로 복귀</span>
          </span>
        </button>
      </nav>

      <div className="divider" />

      <div className="sidebar-section">
        <div
          className="section-header section-header-interactive"
          onClick={() => setShowGoalForm(!showGoalForm)}
        >
          <div className="section-title-copy">
            <h4 className="section-title">목표 설정</h4>
            <span className="section-subtitle">매일 반복할 할 일을 빠르게 만듭니다.</span>
          </div>
          <span className="section-toggle">{showGoalForm ? '−' : '+'}</span>
        </div>

        {showGoalForm && (
          <form onSubmit={handleCreateGoal} className="goal-form">
            <input
              type="text"
              placeholder="매일 할 목표 (예: 영단어 5개)"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="glass-input-sidebar"
              required
            />
            <div className="date-input-wrapper">
              <span className="label-small">언제까지?</span>
              <input
                type="date"
                value={goalEndDate}
                onChange={(e) => setGoalEndDate(e.target.value)}
                className="glass-input-sidebar"
                min={formatDateString(new Date())}
                required
              />
            </div>
            <button type="submit" className="goal-submit-btn">
              목표 만들기
            </button>
          </form>
        )}
      </div>

      <div className="divider" />

      <div className="sidebar-todo-section">
        <div className="todo-title-row">
          <div className="todo-heading-copy">
            <h4 className="todo-title">{formattedDate}</h4>
            <span className="todo-subtitle">오늘 해야 할 일</span>
          </div>
          <span className="todo-counter">{completedCount}/{todos.length || 0} 완료</span>
        </div>

        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            placeholder="할 일 입력..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="todo-input"
          />
          <button type="submit" className="todo-add-btn" disabled={!newTodo.trim()}>
            +
          </button>
        </form>

        <div className="todo-list">
          {todos.length === 0 && <p className="empty-todo">할 일이 없습니다.</p>}
          {todos.map((todo) => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-checkbox-wrapper" onClick={() => toggleDailyTodo(selectedDate, todo.id)}>
                <div className="todo-checkbox">{todo.completed && '✓'}</div>
                <div className="todo-copy">
                  <span className="todo-text">{todo.text}</span>
                  <span className="todo-meta">
                    {todo.completed ? '완료 체크됨' : '진행 중'} · {formatRelativeTimestamp(todo.updatedAt)}
                  </span>
                </div>
              </div>
              <button className="todo-delete" onClick={() => deleteDailyTodo(selectedDate, todo.id)}>
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <div className="footer-chip-row">
            <button
              className="notification-chip"
              onClick={onRequestNotification}
              title={notificationPermission === 'granted' ? '알림이 켜져있습니다' : '알림 켜기'}
              type="button"
            >
              {notificationPermission === 'granted' ? '알림 켜짐' : '알림 켜기'}
            </button>

            <button onClick={onTestNotification} type="button" className="test-chip">
              테스트 알림
            </button>
          </div>

          <GoogleConnectButton onLoginSuccess={onGoogleLogin} onLogout={onGoogleLogout} />
          <span className="version">v1.3.0 Shared-ready polish</span>
        </div>
      </div>
    </div>
  );
};
