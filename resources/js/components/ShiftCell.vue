<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from './AppIcon.vue';
import type { ScheduleView, Shift } from '../types/schedule';
import { formatNumber, formatShiftRange, shiftHours, shiftTone } from '../utils/schedule';

const props = defineProps<{
    shift?: Shift;
    view: ScheduleView;
    selected: boolean;
    dragging: boolean;
    dropTarget: boolean;
    disabled: boolean;
    label: string;
}>();

const timeRange = computed(() => props.shift ? formatShiftRange(props.shift.start_time, props.shift.end_time) : '');
const detailedTime = computed(() => timeRange.value.includes(':'));
const dragFinished = ref(false);
let pointerSelects = false;

const emit = defineEmits<{
    pointerdown: [event: PointerEvent];
    pointerenter: [];
    keyboardToggle: [];
    dragstart: [event: DragEvent];
    dragover: [event: DragEvent];
    dragleave: [];
    drop: [event: DragEvent];
    dragend: [];
}>();

function onPointerDown(event: PointerEvent): void {
    dragFinished.value = false;
    pointerSelects = !props.shift || event.shiftKey || event.pointerType === 'touch';

    if (pointerSelects) {
        emit('pointerdown', event);
    }
}

function onClick(event: MouseEvent): void {
    if (event.detail === 0 || (!dragFinished.value && !pointerSelects)) {
        emit('keyboardToggle');
    }
    dragFinished.value = false;
}

function onDragEnd(): void {
    dragFinished.value = true;
    emit('dragend');
}
</script>

<template>
    <button
        class="shift-cell"
        :class="[shift ? `shift-tone-${shiftTone(shift)}` : '', {
            'cell-filled': shift,
            'cell-selected': selected,
            'cell-dragging': dragging,
            'cell-drop-target': dropTarget,
            'shift-cell--month': view === 'month',
        }]"
        :disabled="disabled"
        :draggable="!!shift && !disabled"
        :aria-pressed="selected"
        :aria-label="label"
        :title="label"
        @pointerdown="onPointerDown"
        @pointerenter="emit('pointerenter')"
        @click="onClick"
        @dragstart="emit('dragstart', $event)"
        @dragover="emit('dragover', $event)"
        @dragleave="emit('dragleave')"
        @drop="emit('drop', $event)"
        @dragend="onDragEnd"
    >
        <span class="shift-content">
            <template v-if="shift">
                <span v-if="view === 'week'" class="shift-time" :class="{ 'shift-time--detailed': detailedTime }">{{ timeRange }}</span>
                <span class="shift-hours">{{ formatNumber(shiftHours(shift.start_time, shift.end_time)) }} ч</span>
            </template>
            <span v-else-if="selected" class="shift-add" aria-hidden="true">
                <AppIcon name="plus" :size="16" />
            </span>
        </span>
    </button>
</template>

<style scoped>
.shift-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: 72px;
    padding: 4px;
    background: transparent;
    border: 0;
    border-radius: 0;
    font-family: 'Manrope', Arial, sans-serif;
    user-select: none;
    touch-action: pan-x pan-y;
}

.shift-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 0;
    height: 64px;
    padding: 4px;
    border: 1px dashed #dedee3;
    border-radius: 8px;
}

.shift-cell:hover:not(:disabled) .shift-content {
    border-color: #b1c3f5;
}

.cell-filled .shift-content {
    max-width: 102px;
    background: var(--shift-background);
    border: 1px solid transparent;
}

.cell-filled:not(:disabled) { cursor: grab; }
.cell-dragging { opacity: .45; cursor: grabbing; }
.cell-drop-target { background: #ebeffd; box-shadow: inset 0 0 0 2px #5b7dec; }
.cell-drop-target .shift-content { border-color: #5b7dec; }

.cell-selected {
    background: #ebeffd;
    box-shadow: inset 0 0 0 1px #5b7dec;
}

.cell-selected .shift-content {
    border-color: transparent;
}

.shift-add {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
    color: white;
    background: #5b7dec;
    border-radius: 99px;
}

.shift-time {
    color: var(--shift-foreground, #101012);
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    white-space: nowrap;
}

.shift-time--detailed {
    font-size: 13px;
}

.shift-hours {
    color: var(--shift-accent);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    white-space: nowrap;
}

.shift-cell--month .shift-hours {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
}
</style>
