<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';
import { formatCount, selectionSummary } from '../utils/schedule';

const props = defineProps<{ selected: ReadonlySet<string>; disabled: boolean; hasAssignments: boolean }>();
defineEmits<{ applyTemplate: []; edit: []; clear: []; deselect: [] }>();

const summary = computed(() => selectionSummary(props.selected));
</script>

<template>
    <div v-if="summary.cells" class="selection-bar" aria-label="Действия с выделенными ячейками">
        <div class="selection-summary" role="status" aria-live="polite" aria-atomic="true">
            <span>Выделено:</span>
            <span class="selection-badge selection-badge--blue">{{ formatCount(summary.cells, ['ячейка', 'ячейки', 'ячеек']) }}</span>
            <span class="selection-badge">{{ formatCount(summary.employees, ['сотрудник', 'сотрудника', 'сотрудников']) }}</span>
            <span class="selection-badge">{{ summary.days }} дн.</span>
        </div>
        <div class="selection-actions" role="group" aria-label="Действия со сменами">
            <button type="button" :disabled="disabled" aria-controls="shift-template-panel" @click="$emit('applyTemplate')">
                <AppIcon name="grid" :size="16" />Применить шаблон
            </button>
            <button v-if="hasAssignments" type="button" :disabled="disabled" aria-controls="shift-template-panel" @click="$emit('edit')">
                <AppIcon name="edit" :size="16" />Изменить
            </button>
            <button type="button" :disabled="disabled" @click="$emit('clear')">
                <AppIcon name="trash" :size="16" />Очистить
            </button>
            <button type="button" :disabled="disabled" @click="$emit('deselect')">
                <AppIcon name="close" :size="16" />Снять
            </button>
        </div>
    </div>
</template>

<style scoped>
.selection-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: 10px;
    min-height: 52px;
    margin-bottom: 12px;
    padding: 8px 12px;
    color: #fff;
    background: #3c3c43;
    border-radius: 8px;
    font-family: 'Manrope', Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
}

.selection-summary, .selection-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.selection-summary { gap: 10px; }
.selection-actions { gap: 8px; }

.selection-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    gap: 4px;
    height: 26px;
    padding: 4px 8px 6px;
    color: #fff;
    background: #242426;
    border-radius: 9999px;
    font-family: 'Manrope', Arial, sans-serif;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
    white-space: nowrap;
}

.selection-badge--blue { background: #3e87ff; }

.selection-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 36px;
    padding: 8px;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 8px;
    font: inherit;
    white-space: nowrap;
}

.selection-actions button:hover:not(:disabled) { background: #595961; }
.selection-actions button:active:not(:disabled) { background: #737378; }
.selection-actions button:disabled { opacity: .45; }
.selection-actions button:focus-visible { outline: 2px solid white; outline-offset: 1px; }
</style>
