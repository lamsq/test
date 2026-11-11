export interface Employee {
    id: number;
    name: string;
    surname: string;
    photo: string | null;
}

export interface Shift {
    id?: number;
    user_id: number;
    shift_date: string;
    start_time: string;
    end_time: string;
    published_at: string | null;
}

export interface ScheduleChange {
    user_id: number;
    shift_date: string;
    start_time: string | null;
    end_time: string | null;
}

export interface ScheduleData {
    users: Employee[];
    shifts: Shift[];
}

export interface ScheduleRange {
    start_date: string;
    end_date: string;
}

export interface ScheduleDay {
    key: string;
    date: Date;
    label: string;
    today: boolean;
    weekend: boolean;
}

export type ScheduleView = 'week' | 'month';
export type ShiftTone = 'morning' | 'day' | 'evening' | 'custom';

export interface ShiftTemplate {
    name: string;
    start: string;
    end: string;
    tone: ShiftTone;
}
