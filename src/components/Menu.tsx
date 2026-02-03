import React, { useState } from 'react';
import { useCalendarStorage } from '../hooks/useCalendarStorage';
import './Menu.css';

interface MenuProps {
  currentView: 'year' | 'month';
  onViewChange: (view: 'year' | 'month') => void;
  onToday: () => void;
  selectedDate: string; // Now required to filter todos
  onGoogleLogin: (token: string) => void;
  onGoogleLogout: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotification: () => void;
  onTestNotification: () => void;
}

import { GoogleConnectButton } from './GoogleConnectButton';

export const Menu: React.FC<MenuProps> = ({ currentView, onViewChange, onToday, selectedDate, onGoogleLogin, onGoogleLogout, notificationPermission, onRequestNotification, onTestNotification }) => {
  // Use Calendar Storage for date-specific todos
  const { getDayData, addDailyTodo, toggleDailyTodo, deleteDailyTodo } = useCalendarStorage();
  // Long-term Goal State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalEndDate, setGoalEndDate] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!goalTitle.trim() || !goalEndDate) return;

      const start = new Date();
      const end = new Date(goalEndDate);
      
      // Simple loop to add todos
      let current = new Date(start);
      while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          addDailyTodo(dateStr, `[목표] ${goalTitle}`);
          current.setDate(current.getDate() + 1);
      }

      setGoalTitle('');
      setGoalEndDate('');
      setShowGoalForm(false);
      alert('목표가 설정되었습니다! 매일 할 일이 추가되었습니다.');
  };

  // Restore Daily Todo State
  const [newTodo, setNewTodo] = useState('');

  const dayData = getDayData(selectedDate);
  const todos = dayData.todos || [];

  const handleAddTodo = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTodo.trim()) return;
      addDailyTodo(selectedDate, newTodo);
      setNewTodo('');
  };

  const formattedDate = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(selectedDate));

  return (
    <div className="sidebar-container">
        <div className="sidebar-header">
            <h3>캘린더</h3>
        </div>
        
        <nav className="sidebar-nav">
            <button 
                className={`sidebar-item ${currentView === 'year' ? 'active' : ''}`}
                onClick={() => onViewChange('year')}
            >
                📆 연간 (Year)
            </button>
            <button 
                className={`sidebar-item ${currentView === 'month' ? 'active' : ''}`}
                onClick={() => onViewChange('month')}
            >
                📅 월간 (Month)
            </button>
            <button 
                className="sidebar-item"
                onClick={onToday}
            >
                📍 오늘 (Today)
            </button>
        </nav>

        <div className="divider" />
        
        {/* Long-term Goal Section */}
        <div className="sidebar-section">
            <div className="section-header" onClick={() => setShowGoalForm(!showGoalForm)} style={{cursor: 'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h4 className="section-title">🏆 목표 설정 (Goal)</h4>
                <span>{showGoalForm ? '−' : '+'}</span>
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
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                    <button type="submit" className="goal-submit-btn">목표 만들기</button>
                </form>
            )}
        </div>

        <div className="divider" />
        
        {/* Date-Specific Todo List */}
        <div className="sidebar-todo-section">
            <h4 className="todo-title">{formattedDate} 할 일</h4>
            
            <form onSubmit={handleAddTodo} className="todo-form">
                <input 
                    type="text" 
                    placeholder="할 일 입력..." 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    className="todo-input"
                />
                <button type="submit" className="todo-add-btn" disabled={!newTodo.trim()}>+</button>
            </form>

            <div className="todo-list">
                {todos.length === 0 && <p className="empty-todo">할 일이 없습니다.</p>}
                {todos.map(todo => (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <div className="todo-checkbox-wrapper" onClick={() => toggleDailyTodo(selectedDate, todo.id)}>
                            <div className="todo-checkbox">
                                {todo.completed && '✓'}
                            </div>
                            <span className="todo-text">{todo.text}</span>
                        </div>
                        <button className="todo-delete" onClick={() => deleteDailyTodo(selectedDate, todo.id)}>×</button>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="sidebar-footer">
            <button 
                className="notification-btn" 
                onClick={onRequestNotification}
                title={notificationPermission === 'granted' ? '알림이 켜져있습니다' : '알림 켜기'}
                style={{
                    background: 'none',
                    border: 'none',
                    color: notificationPermission === 'granted' ? '#FFD700' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    marginBottom: '10px'
                }}
            >
                {notificationPermission === 'granted' ? '🔔' : '🔕'}
            </button>
            
            <button 
                onClick={onTestNotification}
                style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    marginLeft: '8px',
                    fontWeight: 500,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
            >
                Test
            </button>

            <GoogleConnectButton onLoginSuccess={onGoogleLogin} onLogout={onGoogleLogout} />
            <div style={{ height: '10px' }} />
            <span className="version">v5.6 Notification</span>
        </div>
    </div>
  );
};
