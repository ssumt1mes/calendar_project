import { useState, useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { Menu } from './components/Menu';
import { RightPanel } from './components/RightPanel';
import Calendar from './components/Calendar';
import { useNotifications } from './hooks/useNotifications';
import { NotificationModal } from './components/NotificationModal';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Notification Service
  const { permission, requestPermission, sendNotification, activeNotification, closeNotification } = useNotifications();
  
  // Google Calendar State
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);

  // Fetch Google Events when token or month changes
  useEffect(() => {
    if (googleAccessToken) {
        // Fetch for current month view (plus buffer)
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month + 2, 0);
        
        import('./services/googleCalendar').then(({ fetchGoogleEvents }) => {
            fetchGoogleEvents(googleAccessToken, start, end).then(events => {
                setGoogleEvents(events);
            });
        });
    }
  }, [googleAccessToken, currentDate]);

  const handleGoogleLogin = (token: string) => {
      setGoogleAccessToken(token);
  };

  const handleGoogleLogout = () => {
      setGoogleAccessToken(null);
      setGoogleEvents([]);
  };

  // const { year } = getMonthYearDetails(currentDate);

  // Navigation Logic - SAFE: Construct new date from scratch to avoid overflow artifacts
  const handleMonthNav = (direction: 'prev' | 'next') => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // Constructor handles overflow (e.g. month 12 -> next year month 0) safely
      const newDate = new Date(year, month + (direction === 'next' ? 1 : -1), 1);
      setCurrentDate(newDate);
  };

  const handleYearNav = (direction: 'prev' | 'next') => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const newDate = new Date(year + (direction === 'next' ? 1 : -1), month, 1);
      setCurrentDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
      const year = currentDate.getFullYear();
      const newDate = new Date(year, monthIndex, 1);
      setCurrentDate(newDate);
      setViewMode('month');
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setViewMode('month');
    // Also select today in the panel
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  return (
    <ToastProvider>
      <Layout
        leftSidebar={
            <Menu 
                currentView={viewMode}
                onViewChange={setViewMode}
                onToday={goToToday}
                selectedDate={selectedDate || new Date().toISOString().split('T')[0]} // Default to today if null
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
                notificationPermission={permission}
                onRequestNotification={requestPermission}
                onTestNotification={() => sendNotification("🔔 테스트 알림", "시스템 알림이 정상적으로 작동합니다!")}
            />
        }
        rightSidebar={
            <RightPanel 
                selectedDate={selectedDate}
                onClose={() => setSelectedDate(null)}
            />
        }
      >
        <Calendar 
            currentDate={currentDate}
            viewMode={viewMode}
            selectedDate={selectedDate}
            onDateClick={setSelectedDate}
            onMonthNav={handleMonthNav}
            onYearNav={handleYearNav}
            onViewChange={setViewMode}
            onMonthSelect={handleMonthSelect}
            googleEvents={googleEvents}
        />
      </Layout>
      
      <NotificationModal 
        isOpen={!!activeNotification}
        title={activeNotification?.title || ''}
        message={activeNotification?.message || ''}
        onClose={closeNotification}
      />
    </ToastProvider>
  )
}

export default App
