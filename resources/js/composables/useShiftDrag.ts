import { computed, ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { Shift } from '../types/schedule.ts';
import { cellKey } from '../utils/schedule.ts';

export function useShiftDrag(
    shifts: MaybeRefOrGetter<Shift[]>,
    blocked: MaybeRefOrGetter<boolean>,
    move: (sourceKey: string, targetKey: string) => void,
) {
    const sourceKey = ref('');
    const targetKey = ref('');
    const occupied = computed(() => new Set(toValue(shifts).map(shift => cellKey(shift.user_id, shift.shift_date))));

    function end(): void {
        sourceKey.value = '';
        targetKey.value = '';
    }

    function start(event: DragEvent, key: string): void {
        if (toValue(blocked) || !occupied.value.has(key) || !event.dataTransfer) {
            event.preventDefault();
            end();
            return;
        }

        sourceKey.value = key;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/x-crm-shift', key);
    }

    function canDrop(key: string): boolean {
        return !toValue(blocked) && !!sourceKey.value && occupied.value.has(sourceKey.value)
            && key !== sourceKey.value && !occupied.value.has(key);
    }

    function over(event: DragEvent, key: string): void {
        const allowed = canDrop(key);
        targetKey.value = allowed ? key : '';

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = allowed ? 'move' : 'none';
        }

        if (allowed) {
            event.preventDefault();
        }
    }

    function leave(key: string): void {
        if (targetKey.value === key) {
            targetKey.value = '';
        }
    }

    function drop(event: DragEvent, key: string): void {
        if (sourceKey.value) {
            event.preventDefault();

            if (canDrop(key)) {
                move(sourceKey.value, key);
            }
        }

        end();
    }

    watch(() => toValue(blocked), value => { if (value) end(); });

    return { sourceKey, targetKey, start, over, leave, drop, end };
}
