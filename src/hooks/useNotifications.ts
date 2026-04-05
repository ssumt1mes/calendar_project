import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useCalendarStorage } from './useCalendarStorage';
import { formatDateString } from '../utils/dateUtils';

const APP_ICON_PATH = '/pwa-192x192.png';

const isNativePlatform = () => Capacitor.isNativePlatform();

const getInitialPermission = (): NotificationPermission => {
    if (typeof window === 'undefined') {
        return 'default';
    }

    if (isNativePlatform()) {
        return 'default';
    }

    if (!('Notification' in window)) {
        return 'default';
    }

    return window.Notification.permission;
};

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission());
    const [activeNotification, setActiveNotification] = useState<{title: string, message: string} | null>(null);
    const { getAllEvents } = useCalendarStorage();
    const deliveredNotificationKeys = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!isNativePlatform()) {
            return;
        }

        LocalNotifications.checkPermissions().then((result) => {
            setPermission(result.display === 'granted' ? 'granted' : 'default');
        }).catch(() => {
            setPermission('default');
        });
    }, []);

    const requestPermission = async () => {
        if (isNativePlatform()) {
            const result = await LocalNotifications.requestPermissions();
            const granted = result.display === 'granted';
            setPermission(granted ? 'granted' : 'denied');

            if (granted) {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            id: Date.now(),
                            title: '알림이 켜졌습니다!',
                            body: '이제 예정된 일정에 대해 알림을 받게 됩니다.',
                            schedule: { at: new Date(Date.now() + 1000) },
                        },
                    ],
                });
            }
            return;
        }

        if (!('Notification' in window)) {
            return;
        }
        
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            new Notification('알림이 켜졌습니다!', {
                body: '이제 예정된 일정에 대해 알림을 받게 됩니다.',
                icon: APP_ICON_PATH,
            });
        }
    };

    const emitSystemNotification = async (title: string, body: string) => {
        if (isNativePlatform()) {
            if (permission !== 'granted') {
                return;
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: Date.now(),
                        title,
                        body,
                        schedule: { at: new Date(Date.now() + 1000) },
                    },
                ],
            });
            return;
        }

        if ('Notification' in window && window.Notification.permission === 'granted') {
            new Notification(title, { body, icon: APP_ICON_PATH });
        }
    };

    // Check for events every minute
    useEffect(() => {
        if (permission !== 'granted') return;

        const interval = setInterval(() => {
            const now = new Date();
            const currentIsoDate = formatDateString(now);
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const allEvents = getAllEvents();
            const todaysEvents = allEvents.filter(e => e.date === currentIsoDate);

            todaysEvents.forEach(event => {
                if (!event.time) {
                    return;
                }

                const [evtHour, evtMinute] = event.time.split(':').map(Number);
                const eventTimeInMinutes = evtHour * 60 + evtMinute;
                const currentTimeInMinutes = currentHour * 60 + currentMinute;

                const exactKey = `${event.id}:${currentIsoDate}:exact:${currentTimeInMinutes}`;
                const reminderKey = `${event.id}:${currentIsoDate}:reminder:${currentTimeInMinutes}`;

                if (currentHour === evtHour && currentMinute === evtMinute && !deliveredNotificationKeys.current.has(exactKey)) {
                    const title = `[일정] ${event.title}`;
                    const body = event.description || '지금 예정된 일정이 있습니다.';
                    deliveredNotificationKeys.current.add(exactKey);
                    void emitSystemNotification(title, body);
                    setActiveNotification({ title, message: body });
                }

                if (eventTimeInMinutes - currentTimeInMinutes === 10 && !deliveredNotificationKeys.current.has(reminderKey)) {
                    const title = `[10분 전] ${event.title}`;
                    const body = '곧 시작되는 일정이 있습니다.';
                    deliveredNotificationKeys.current.add(reminderKey);
                    void emitSystemNotification(title, body);
                    setActiveNotification({ title, message: body });
                }
            });

        }, 60000);

        return () => clearInterval(interval);
    }, [permission, getAllEvents]);

    const sendNotification = (title: string, body: string) => {
        setActiveNotification({ title, message: body });
        void emitSystemNotification(title, body);
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
