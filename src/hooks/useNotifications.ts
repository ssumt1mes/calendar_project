import { useState, useEffect } from 'react';
import { useCalendarStorage } from './useCalendarStorage';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
    const [activeNotification, setActiveNotification] = useState<{title: string, message: string} | null>(null);
    const { getAllEvents } = useCalendarStorage();

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('이 브라우저는 데스크탑 알림을 지원하지 않습니다.');
            return;
        }
        
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            new Notification('알림이 켜졌습니다!', {
                body: '이제 예정된 일정에 대해 알림을 받게 됩니다.',
                icon: '/vite.svg' // Placeholder icon
            });
        }
    };

    // Check for events every minute
    useEffect(() => {
        if (permission !== 'granted') return;

        const interval = setInterval(() => {
            const now = new Date();
            const currentIsoDate = now.toISOString().split('T')[0];
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const allEvents = getAllEvents();
            
            // Filter events for today
            const todaysEvents = allEvents.filter(e => e.date === currentIsoDate);

            todaysEvents.forEach(event => {
                if (event.time) {
                    const [evtHour, evtMinute] = event.time.split(':').map(Number);
                    
                    // Trigger notification if times match exactly
                    // Note: This logic depends on the interval running reliably.
                    // Ideally, we'd check if we are *within* a minute window to avoid skipping.
                    if (currentHour === evtHour && currentMinute === evtMinute) {
                        const title = `[일정] ${event.title}`;
                        const body = event.description || '지금 예정된 일정이 있습니다.';
                        
                        // System Notification
                        new Notification(title, { body, icon: '/vite.svg' });
                        // In-App Modal
                        setActiveNotification({ title, message: body });
                    }
                    
                    // 10 minutes before reminder
                    const eventTimeInMinutes = evtHour * 60 + evtMinute;
                    const currentTimeInMinutes = currentHour * 60 + currentMinute;
                    
                    if (eventTimeInMinutes - currentTimeInMinutes === 10) {
                         const title = `[10분 전] ${event.title}`;
                         const body = '곧 시작되는 일정이 있습니다.';
                         
                         new Notification(title, { body, icon: '/vite.svg' });
                         setActiveNotification({ title, message: body });
                    }
                }
            });

        }, 60000); // Check every 60 seconds

        return () => clearInterval(interval);
    }, [permission, getAllEvents]);

    // Manual Trigger
    const sendNotification = (title: string, body: string) => {
        // Trigger In-App Modal
        setActiveNotification({ title, message: body });

        // Trigger System Notification
        if (Notification.permission === 'granted') {
             new Notification(title, { body, icon: '/vite.svg' });
        }
    };

    const closeNotification = () => setActiveNotification(null);

    return {
        permission,
        requestPermission,
        sendNotification,
        activeNotification,
        closeNotification
    };
};
