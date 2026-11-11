import { computed, ref, toValue } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type { Employee, Shift } from '../types/schedule.ts';
import { cellKey, cellsForDate } from '../utils/schedule.ts';

interface AssignmentOptions {
    selected: Ref<Set<string>>;
    replaceSelection: (keys: Iterable<string>) => void;
    users: MaybeRefOrGetter<Employee[]>;
    shifts: MaybeRefOrGetter<Shift[]>;
    blocked: MaybeRefOrGetter<boolean>;
}

export function useShiftAssignment(options: AssignmentOptions) {
    const customStart = ref('09:00');
    const customEnd = ref('17:00');
    const selectedShifts = computed(() => toValue(options.shifts)
        .filter(shift => options.selected.value.has(cellKey(shift.user_id, shift.shift_date))));
    const hasAssignments = computed(() => selectedShifts.value.length > 0);

    function selectDate(date: string): void {
        const users = toValue(options.users);

        if (!toValue(options.blocked) && users.length) {
            options.replaceSelection(cellsForDate(users, date));
        }
    }

    function prepareEdit(): boolean {
        const existing = selectedShifts.value[0];

        if (toValue(options.blocked) || !existing) {
            return false;
        }

        customStart.value = existing.start_time;
        customEnd.value = existing.end_time;

        return true;
    }

    return { customStart, customEnd, hasAssignments, selectDate, prepareEdit };
}
