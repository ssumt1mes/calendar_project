import { describe, it, expect } from 'vitest';
import { generateCalendarGrid, getZodiacAnimal, formatDateString, isSameDate } from './dateUtils';

describe('Date Utils', () => {
    describe('formatDateString', () => {
        it('should format date as YYYY-MM-DD', () => {
             const date = new Date(2024, 0, 1); // Jan 1, 2024
             expect(formatDateString(date)).toBe('2024-01-01');
        });

        it('should pad single digits with zero', () => {
             const date = new Date(2024, 3, 5); // April 5, 2024
             expect(formatDateString(date)).toBe('2024-04-05');
        });
    });

    describe('generateCalendarGrid', () => {
        it('should always return 42 cells', () => {
            const date = new Date(2023, 11, 15); // Dec 2023
            const grid = generateCalendarGrid(date);
            expect(grid).toHaveLength(42);
        });

        it('should mark today correctly', () => {
            const today = new Date();
            const grid = generateCalendarGrid(today);
            const todayCell = grid.find(cell => cell.isToday);
            expect(todayCell).toBeDefined();
            expect(isSameDate(todayCell!.date, today)).toBe(true);
        });
    });

    describe('getZodiacAnimal', () => {
        it('should return correct animal for 2024 (Dragon)', () => {
            // 2024 is Year of the Wood Dragon (Blue Dragon in KR tradition usually, or Green)
            // Code says: Gap (Blue) + Jin (Dragon) -> Blue Dragon
            const zodiac = getZodiacAnimal(2024);
            expect(zodiac.animal).toBe('용');
            expect(zodiac.emoji).toBe('🐲');
            expect(zodiac.color).toBe('Blue'); // 갑 -> Blue
        });

        it('should return correct animal for 2025 (Snake)', () => {
             const zodiac = getZodiacAnimal(2025);
             expect(zodiac.animal).toBe('뱀');
             expect(zodiac.emoji).toBe('🐍');
        });
    });
});
