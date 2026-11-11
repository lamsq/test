import { onMounted, onScopeDispose, ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { cellKey, shiftTemplates } from '../utils/schedule.ts';

export function useCellSelection(
    blocked: MaybeRefOrGetter<boolean>,
    applyTimes: (start: string | null, end: string | null) => void,
) {
    const selected = ref(new Set<string>());
    let dragging = false;
    let dragSelect = true;

    function clear(): void {
        selected.value = new Set();
        dragging = false;
    }

    function replace(keys: Iterable<string>): void {
        if (!toValue(blocked)) {
            selected.value = new Set(keys);
            dragging = false;
        }
    }

    function setSelected(key: string, value: boolean): void {
        const next = new Set(selected.value);

        if (value) {
            next.add(key);
        } else {
            next.delete(key);
        }

        selected.value = next;
    }

    function toggle(userId: number, date: string): void {
        if (!toValue(blocked)) {
            const key = cellKey(userId, date);
            setSelected(key, !selected.value.has(key));
        }
    }

    function start(event: PointerEvent, userId: number, date: string): void {
        if (event.button !== 0 || toValue(blocked)) {
            return;
        }

        event.preventDefault();
        (event.currentTarget as HTMLElement).focus();
        dragging = true;
        const key = cellKey(userId, date);
        dragSelect = !selected.value.has(key);
        setSelected(key, dragSelect);
    }

    function enter(userId: number, date: string): void {
        if (dragging && !toValue(blocked)) {
            const key = cellKey(userId, date);
            setSelected(key, dragSelect);
        }
    }

    function stop(): void {
        dragging = false;
    }

    function keydown(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;

        if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        const preset = shiftTemplates[Number(event.key) - 1];

        if (preset && ['1', '2', '3'].includes(event.key)) {
            applyTimes(preset.start, preset.end);
        }

        if (event.key === 'Escape') {
            clear();
        }

        if ((event.key === 'Delete' || event.key === 'Backspace') && selected.value.size) {
            event.preventDefault();
            applyTimes(null, null);
        }
    }

    onMounted(() => {
        window.addEventListener('pointerup', stop);
        window.addEventListener('pointercancel', stop);
        window.addEventListener('keydown', keydown);
    });

    onScopeDispose(() => {
        window.removeEventListener('pointerup', stop);
        window.removeEventListener('pointercancel', stop);
        window.removeEventListener('keydown', keydown);
    });

    return { selected, clear, replace, toggle, start, enter };
}
