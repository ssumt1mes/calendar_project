export const HOLIDAYS: Record<string, string> = {
    '01-01': '신정',
    '03-01': '삼일절',
    '05-05': '어린이날',
    '06-06': '현충일',
    '08-15': '광복절',
    '10-03': '개천절',
    '10-09': '한글날',
    '12-25': '크리스마스',
    // Lunar holidays (Approx for 2024-2025)
    '2024-02-09': '설날 연휴',
    '2024-02-10': '설날',
    '2024-02-11': '설날 연휴',
    '2024-02-12': '대체공휴일',
    '2024-04-10': '국회의원선거',
    '2024-05-15': '부처님오신날',
    '2024-09-16': '추석 연휴',
    '2024-09-17': '추석',
    '2024-09-18': '추석 연휴',
    '2025-01-28': '설날 연휴',
    '2025-01-29': '설날',
    '2025-01-30': '설날 연휴',
    '2025-10-06': '추석',
};

export const getHoliday = (date: Date): string | null => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    
    // Check YYYY-MM-DD
    const fullDate = `${y}-${m}-${d}`;
    if (HOLIDAYS[fullDate]) return HOLIDAYS[fullDate];

    // Check MM-DD (Recurring)
    const subDate = `${m}-${d}`;
    if (HOLIDAYS[subDate]) return HOLIDAYS[subDate];

    return null;
};
