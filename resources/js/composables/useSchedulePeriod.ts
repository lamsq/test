import { computed, ref } from 'vue';
import type { ScheduleDay, ScheduleRange, ScheduleView } from '../types/schedule.ts';
import { dateKey } from '../utils/schedule.ts';

export function useSchedulePeriod(initialDate = new Date()) {
    const view = ref<ScheduleView>('week');
    const anchor = ref(new Date(initialDate));

    const firstDay = computed(() => {
        const date = new Date(anchor.value.getFullYear(), anchor.value.getMonth(), anchor.value.getDate(), 12);

        if (view.value === 'month') {
            date.setDate(1);
        } else {
            date.setDate(date.getDate() - (date.getDay() + 6) % 7);
        }

        return date;
    });

    const days = computed<ScheduleDay[]>(() => {
        const count = view.value === 'week' ? 7 : new Date(firstDay.value.getFullYear(), firstDay.value.getMonth() + 1, 0).getDate();

        return Array.from({ length: count }, (_, index) => {
            const date = new Date(firstDay.value);
            date.setDate(date.getDate() + index);

            return {
                key: dateKey(date),
                date,
                label: new Intl.DateTimeFormat('ru', { weekday: 'short' }).format(date),
                today: dateKey(date) === dateKey(new Date()),
                weekend: [0, 6].includes(date.getDay()),
            };
        });
    });

    const range = computed<ScheduleRange>(() => ({
        start_date: days.value[0]!.key,
        end_date: days.value[days.value.length - 1]!.key,
    }));

    const periodLabel = computed(() => {
        if (view.value === 'month') {
            return new Intl.DateTimeFormat('ru', { month: 'long', year: 'numeric' }).format(firstDay.value).replace(' г.', '');
        }

        const format = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' });

        return `${format.format(firstDay.value)} — ${format.format(days.value[6]!.date)}`;
    });

    function move(direction: number, nextView: ScheduleView = view.value): void {
        const date = new Date(anchor.value);

        if (direction !== 0) {
            if (view.value === 'month') {
                date.setDate(1);
                date.setMonth(date.getMonth() + direction);
            } else {
                date.setDate(date.getDate() + direction * 7);
            }
        }

        anchor.value = date;
        view.value = nextView;
    }

    return { view, days, range, periodLabel, move };
}
