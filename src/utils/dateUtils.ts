import { CalendarCell } from '../types';

export const getMonthYearDetails = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  return { year, month, monthName };
};

export const generateCalendarGrid = (currentDate: Date): CalendarCell[] => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = lastDayOfMonth.getDate();

  const grid: CalendarCell[] = [];

  // Previous month padding
  /*
    NOTE: Using new Date(year, month, 0) gives the last day of the previous month.
    We iterate backwards to fill the start.
  */
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    grid.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
      dateString: formatDateString(date),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    grid.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDate(date, new Date()),
      dateString: formatDateString(date),
    });
  }

  // Next month padding
  // Always ensure grid has 42 cells (6 rows x 7 cols) for stable UI
  const TOTAL_CELLS = 42;
  const REMAINING_CELLS = TOTAL_CELLS - grid.length;
  
  for (let i = 1; i <= REMAINING_CELLS; i++) {
    const date = new Date(year, month + 1, i);
    grid.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
      dateString: formatDateString(date),
    });
  }

  return grid;
};

export const formatDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const isSameDate = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getZodiacAnimal = (year: number) => {
    // 10 Heavenly Stems (Attributes/Colors)
    const stems = [
        { name: '경', color: 'White', colorKr: '백', desc: '하얀' }, // Metal
        { name: '신', color: 'White', colorKr: '백', desc: '하얀' },
        { name: '임', color: 'Black', colorKr: '흑', desc: '검은' }, // Water
        { name: '계', color: 'Black', colorKr: '흑', desc: '검은' },
        { name: '갑', color: 'Blue', colorKr: '청', desc: '푸른' }, // Wood
        { name: '을', color: 'Blue', colorKr: '청', desc: '푸른' },
        { name: '병', color: 'Red', colorKr: '적', desc: '붉은' }, // Fire
        { name: '정', color: 'Red', colorKr: '적', desc: '붉은' },
        { name: '무', color: 'Yellow', colorKr: '황', desc: '황금' }, // Earth
        { name: '기', color: 'Yellow', colorKr: '황', desc: '황금' }
    ];
    
    // 12 Earthly Branches (Animals)
    const branches = [
        { name: '신', animal: '원숭이', emoji: '🐵' },
        { name: '유', animal: '닭', emoji: '🐔' },
        { name: '술', animal: '개', emoji: '🐶' },
        { name: '해', animal: '돼지', emoji: '🐷' },
        { name: '자', animal: '쥐', emoji: '🐭' },
        { name: '축', animal: '소', emoji: '🐮' },
        { name: '인', animal: '호랑이', emoji: '🐯' },
        { name: '묘', animal: '토끼', emoji: '🐰' },
        { name: '진', animal: '용', emoji: '🐲' },
        { name: '사', animal: '뱀', emoji: '🐍' },
        { name: '오', animal: '말', emoji: '🐴' },
        { name: '미', animal: '양', emoji: '🐑' }
    ];
    
    const stemIndex = year % 10;
    const branchIndex = year % 12;
    
    const stem = stems[stemIndex];
    const branch = branches[branchIndex];
    
    return {
        korYear: `${stem.name}${branch.name}년`, // e.g., 병오년
        desc: `${stem.desc} ${branch.animal}의 해`, // e.g., 붉은 말의 해
        animal: branch.animal,
        emoji: branch.emoji,
        color: stem.color
    };
};

export const getSeasonStyle = (monthIndex: number) => {
    // Minimal Premium Style (Glass & Icon Only)
    // No colorful backgrounds, just subtle glass + Icon
    
    const baseStyle = {
        gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
        border: 'rgba(255, 255, 255, 0.6)',
        text: '#1d1d1f',
        iconOpacity: 0.8
    };

    if (monthIndex >= 2 && monthIndex <= 4) return { ...baseStyle, name: 'Spring', icon: '🌸' };
    if (monthIndex >= 5 && monthIndex <= 7) return { ...baseStyle, name: 'Summer', icon: '🌿' };
    if (monthIndex >= 8 && monthIndex <= 10) return { ...baseStyle, name: 'Autumn', icon: '🍁' };
    return { ...baseStyle, name: 'Winter', icon: '❄️' };
};
