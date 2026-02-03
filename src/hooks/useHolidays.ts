import { useState, useEffect } from 'react';

interface HolidayAPIItem {
    date: string;
    localName: string;
    name: string;
    countryCode: string;
}

const CACHE_PREFIX = 'holidays_cache_';

export const useHolidays = (currentDate: Date) => {
    const [holidays, setHolidays] = useState<Record<string, string>>({});

    useEffect(() => {
        const year = currentDate.getFullYear();
        // Fetch for current year, prev, and next year to handle edge cases
        fetchHolidaysForYear(year);
        fetchHolidaysForYear(year + 1);
        fetchHolidaysForYear(year - 1);
    }, [currentDate.getFullYear()]); // Re-run if year changes

    const fetchHolidaysForYear = async (year: number) => {
        const cacheKey = `${CACHE_PREFIX}${year}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setHolidays(prev => ({ ...prev, ...parsed }));
                return;
            } catch (e) {
                console.warn('Invalid holiday cache', e);
            }
        }

        try {
            const res = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/KR`);
            if (!res.ok) throw new Error('Failed to fetch holidays');
            
            const data: HolidayAPIItem[] = await res.json();
            
            const holidayMap: Record<string, string> = {};
            data.forEach(item => {
                holidayMap[item.date] = item.localName;
            });

            // Update state
            setHolidays(prev => ({ ...prev, ...holidayMap }));
            
            // Save to cache
            localStorage.setItem(cacheKey, JSON.stringify(holidayMap));

        } catch (error) {
            console.error(`Failed to fetch holidays for ${year}:`, error);
        }
    };

    const getHoliday = (date: Date): string | null => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dateString = `${y}-${m}-${d}`;
        
        return holidays[dateString] || null;
    };

    return { getHoliday };
};
