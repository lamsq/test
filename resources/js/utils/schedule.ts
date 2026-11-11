import type { Employee, Shift, ShiftTemplate, ShiftTone } from '../types/schedule.ts';

export const shiftTemplates: ShiftTemplate[] = [
    { name: 'Утро', start: '07:00', end: '15:00', tone: 'morning' },
    { name: 'День', start: '10:00', end: '18:00', tone: 'day' },
    { name: 'Вечер', start: '15:00', end: '23:00', tone: 'evening' },
];

export function cellKey(userId: number, date: string): string {
    return `${userId}/${date}`;
}

export function cellsForDate(users: readonly Pick<Employee, 'id'>[], date: string): Set<string> {
    return new Set(users.map(user => cellKey(user.id, date)));
}

export function selectionSummary(selected: ReadonlySet<string>) {
    const users = new Set<string>();
    const dates = new Set<string>();

    for (const key of selected) {
        const [userId, date] = key.split('/');

        if (userId && date) {
            users.add(userId);
            dates.add(date);
        }
    }

    return { cells: selected.size, employees: users.size, days: dates.size };
}

export function formatCount(count: number, forms: readonly [string, string, string]): string {
    const rule = new Intl.PluralRules('ru').select(count);
    const word = rule === 'one' ? forms[0] : rule === 'few' ? forms[1] : forms[2];

    return `${count} ${word}`;
}

export function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function shiftHours(start: string, end: string): number {
    const minutes = (time: string): number => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

    return Math.max(0, minutes(end) - minutes(start)) / 60;
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('ru', { maximumFractionDigits: 1 }).format(value);
}

export function formatShiftRange(start: string, end: string): string {
    const displayTime = (time: string): string => time.endsWith(':00') ? time.slice(0, 2) : time;

    return `${displayTime(start)} – ${displayTime(end)}`;
}

export function shiftTone(shift: Shift): ShiftTone {
    return shiftTemplates.find(template => template.start === shift.start_time && template.end === shift.end_time)?.tone ?? 'custom';
}
