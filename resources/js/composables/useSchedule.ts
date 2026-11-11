import { computed, onScopeDispose, ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { Employee, ScheduleChange, ScheduleData, ScheduleRange, Shift } from '../types/schedule.ts';
import { cellKey } from '../utils/schedule.ts';

async function responseData(response: Response): Promise<ScheduleData> {
    if (!response.ok) {
        if (response.status === 419) {
            throw new Error('Сессия истекла. Обновите страницу перед сохранением.');
        }

        const data = await response.json().catch(() => ({}));

        throw new Error(data.errors
            ? Object.values(data.errors).flat().join(' ')
            : 'Не удалось связаться с сервером. Попробуйте еще раз.');
    }

    return response.json() as Promise<ScheduleData>;
}

export function useSchedule(endpoint: MaybeRefOrGetter<string>, range: MaybeRefOrGetter<ScheduleRange>) {
    const users = ref<Employee[]>([]);
    const shifts = ref<Shift[]>([]);
    const changes = ref<Record<string, ScheduleChange>>({});
    const loading = ref(true);
    const saving = ref(false);
    const error = ref('');
    let loadController: AbortController | undefined;

    const dirty = computed(() => Object.keys(changes.value).length > 0);
    const blocked = computed(() => loading.value || saving.value || error.value !== '');
    const published = computed(() => !dirty.value && shifts.value.length > 0 && shifts.value.every(shift => shift.published_at));

    function acceptData(data: ScheduleData): void {
        users.value = data.users;
        shifts.value = data.shifts;
        changes.value = {};
    }

    function discardChanges(): void {
        shifts.value = [];
        changes.value = {};
    }

    async function load(): Promise<boolean> {
        loadController?.abort();
        const controller = new AbortController();
        loadController = controller;
        loading.value = true;
        error.value = '';

        try {
            const params = new URLSearchParams({ ...toValue(range) });
            const response = await fetch(`${toValue(endpoint)}?${params}`, {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            });
            const data = await responseData(response);

            if (controller.signal.aborted) {
                return false;
            }

            acceptData(data);

            return true;
        } catch (cause) {
            if (!controller.signal.aborted) {
                error.value = cause instanceof Error ? cause.message : 'Не удалось загрузить график.';
            }

            return false;
        } finally {
            if (loadController === controller) {
                loading.value = false;
            }
        }
    }

    function applyTimes(selected: ReadonlySet<string>, start: string | null, end: string | null): void {
        if (!selected.size || blocked.value) {
            return;
        }

        const next = shifts.value.filter(shift => !selected.has(cellKey(shift.user_id, shift.shift_date)));
        const edits = { ...changes.value };

        for (const key of selected) {
            const [id, date] = key.split('/');

            if (!date) {
                continue;
            }

            const userId = Number(id);
            edits[key] = { user_id: userId, shift_date: date, start_time: start, end_time: end };

            if (start && end) {
                next.push({ user_id: userId, shift_date: date, start_time: start, end_time: end, published_at: null });
            }
        }

        shifts.value = next;
        changes.value = edits;
    }

    function moveShift(sourceKey: string, targetKey: string): boolean {
        if (blocked.value || sourceKey === targetKey) {
            return false;
        }

        const source = shifts.value.find(shift => cellKey(shift.user_id, shift.shift_date) === sourceKey);
        const occupied = shifts.value.some(shift => cellKey(shift.user_id, shift.shift_date) === targetKey);
        const [targetId, targetDate] = targetKey.split('/');
        const currentRange = toValue(range);

        if (!source || occupied || !users.value.some(user => user.id === Number(targetId))
            || !targetDate || targetDate < currentRange.start_date || targetDate > currentRange.end_date) {
            return false;
        }

        applyTimes(new Set([sourceKey]), null, null);
        applyTimes(new Set([targetKey]), source.start_time, source.end_time);

        return true;
    }

    async function save(publish: boolean): Promise<boolean> {
        if (blocked.value || (!dirty.value && !publish) || (publish && !shifts.value.length)) {
            return false;
        }

        saving.value = true;

        try {
            const csrf = typeof document === 'undefined' ? '' : document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const response = await fetch(toValue(endpoint), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ ...toValue(range), publish, changes: Object.values(changes.value) }),
            });
            acceptData(await responseData(response));

            return true;
        } finally {
            saving.value = false;
        }
    }

    onScopeDispose(() => loadController?.abort());

    return { users, shifts, changes, loading, saving, error, dirty, blocked, published, load, applyTimes, moveShift, save, discardChanges };
}
