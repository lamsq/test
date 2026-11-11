<script setup lang="ts">
import { computed, reactive } from 'vue';
import AppIcon from './AppIcon.vue';
import AppButton from './AppButton.vue';
import EmployeeSummary from './EmployeeSummary.vue';
import ShiftCell from './ShiftCell.vue';
import type { Employee, ScheduleDay, ScheduleView, Shift } from '../types/schedule';
import { cellKey, formatNumber, shiftHours } from '../utils/schedule';
import { useShiftDrag } from '../composables/useShiftDrag';

const props = defineProps<{
    users: Employee[];
    totalUsers: number;
    shifts: Shift[];
    days: ScheduleDay[];
    view: ScheduleView;
    selected: ReadonlySet<string>;
    loading: boolean;
    saving: boolean;
    error: string;
}>();

const dayColumnWidth = computed(() => props.view === 'month' ? 64 : 110);
const tableWidth = computed(() => `max(100%, ${220 + props.days.length * dayColumnWidth.value}px)`);

const emit = defineEmits<{
    retry: [];
    select: [event: PointerEvent, userId: number, date: string];
    enter: [userId: number, date: string];
    toggle: [userId: number, date: string];
    selectDate: [date: string];
    moveShift: [sourceKey: string, targetKey: string];
}>();

const drag = reactive(useShiftDrag(
    () => props.shifts,
    () => props.loading || props.saving || !!props.error,
    (source, target) => emit('moveShift', source, target),
));

const shiftMap = computed(() => new Map(
    props.shifts.map(shift => [cellKey(shift.user_id, shift.shift_date), shift]))
);

const employeeHours = computed(() => {
    const totals = new Map<number, number>();

    for (const shift of props.shifts) {
        totals.set(shift.user_id, (totals.get(shift.user_id) ?? 0) + shiftHours(shift.start_time, shift.end_time));
    }

    return totals;
});

const coverage = computed(() => {
    const employeesByDate = new Map<string, Set<number>>();

    for (const shift of props.shifts) {
        const employees = employeesByDate.get(shift.shift_date) ?? new Set<number>();
        employees.add(shift.user_id);
        employeesByDate.set(shift.shift_date, employees);
    }

    return Object.fromEntries([...employeesByDate].map(([date, employees]) => [date, employees.size]));
});

const rows = computed(() => props.users.map(user => ({
    user,
    hours: formatNumber(employeeHours.value.get(user.id) ?? 0),
    cells: props.days.map(day => {
        const key = cellKey(user.id, day.key);
        const shift = shiftMap.value.get(key);

        return {
            key,
            day,
            shift,
            selected: props.selected.has(key),
            label: `${user.surname} ${user.name}, ${day.key}: ${shift ? `${shift.start_time}–${shift.end_time}`
                : 'нет смены'
            }`,
        };
    }),
})));
</script>

<template>
    <div class="schedule-content">
        <div v-if="error" class="state-panel" role="alert">
            <AppIcon name="calendar" :size="30" />
            <h2>Не удалось загрузить график</h2>
            <p>{{ error }}</p>
            <AppButton variant="secondary" @click="$emit('retry')">Попробовать еще раз</AppButton>
        </div>
        <div v-else-if="loading" class="state-panel" role="status">
            <span class="spinner"></span>
            <p>Загружаем график…</p>
        </div>
        <div v-else-if="!totalUsers" class="state-panel">
            <AppIcon name="calendar" :size="30" />
            <h2>Пока нет сотрудников</h2>
            <p>Добавленные сотрудники появятся здесь.</p>
        </div>
        <div v-else class="table-scroll" tabindex="0" aria-label="Таблица смен">
            <table class="schedule-table" :class="{ 'month-view': view === 'month' }" :style="{ width: tableWidth }">
                <colgroup>
                    <col style="width: 220px" />
                    <col v-for="day in days" :key="day.key" :style="{ width: `${dayColumnWidth}px` }" />
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col" class="employee-column">Сотрудник</th>
                        <th
                            v-for="day in days"
                            :key="day.key"
                            scope="col"
                            :class="{ 'is-today': day.today, 'is-weekend': day.weekend }"
                        >
                            <button
                                type="button"
                                class="schedule-date"
                                :disabled="loading || saving || !!error || !users.length"
                                :class="{ 'date-selected': users.length > 0 && users.every(user => selected.has(cellKey(user.id, day.key))) }"
                                :aria-label="`Выделить ячейки на ${day.key} для всех показанных сотрудников`"
                                :aria-pressed="users.length > 0 && users.every(user => selected.has(cellKey(user.id, day.key)))"
                                @click="$emit('selectDate', day.key)"
                            >
                                <span>{{ day.label }}</span> <span class="day-number">{{ day.date.getDate() }}</span>
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in rows" :key="row.user.id">
                        <th scope="row" class="employee-column">
                            <EmployeeSummary :employee="row.user" :hours="row.hours" />
                        </th>
                        <td v-for="cell in row.cells" :key="cell.day.key" :class="{ 'is-weekend': cell.day.weekend }">
                            <ShiftCell
                                :shift="cell.shift"
                                :view="view"
                                :selected="cell.selected"
                                :dragging="drag.sourceKey === cell.key"
                                :drop-target="drag.targetKey === cell.key"
                                :disabled="saving"
                                :label="cell.label"
                                @pointerdown="$emit('select', $event, row.user.id, cell.day.key)"
                                @pointerenter="$emit('enter', row.user.id, cell.day.key)"
                                @keyboard-toggle="$emit('toggle', row.user.id, cell.day.key)"
                                @dragstart="drag.start($event, cell.key)"
                                @dragover="drag.over($event, cell.key)"
                                @dragleave="drag.leave(cell.key)"
                                @drop="drag.drop($event, cell.key)"
                                @dragend="drag.end"
                            />
                        </td>
                    </tr>
                    <tr v-if="!rows.length">
                        <td :colspan="days.length + 1" class="search-empty">Сотрудники не найдены</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th
                            scope="row"
                            class="employee-column"
                            title="Количество сотрудников со сменой в етот день"
                        >
                            Покрытие
                        </th>
                        <td
                            v-for="day in days"
                            :key="day.key"
                            :class="coverage[day.key] ? 'coverage-filled' : 'coverage-empty'"
                        >
                            {{ coverage[day.key] ?? 0 }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<style scoped>
.schedule-date {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 24px;
    padding: 0 4px;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 5px;
    font: inherit;
}

.schedule-date:hover:not(:disabled), .schedule-date.date-selected { color: #1c4ae5; background: #e8edfc; }
.schedule-date:disabled { opacity: .5; }
</style>
