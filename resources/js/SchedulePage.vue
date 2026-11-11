<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import AppIcon from './components/AppIcon.vue';
import AppButton from './components/AppButton.vue';
import AppToast from './components/AppToast.vue';
import ScheduleGrid from './components/ScheduleGrid.vue';
import ScheduleToolbar from './components/ScheduleToolbar.vue';
import ShiftTemplates from './components/ShiftTemplates.vue';
import SelectionBar from './components/SelectionBar.vue';
import { useCellSelection } from './composables/useCellSelection';
import { useSchedule } from './composables/useSchedule';
import { useSchedulePeriod } from './composables/useSchedulePeriod';
import { useShiftAssignment } from './composables/useShiftAssignment';
import type { ScheduleView } from './types/schedule';

const props = withDefaults(defineProps<{ endpoint?: string }>(), { endpoint: '/schedule' });
const { view, days, range, periodLabel, move } = useSchedulePeriod();
const {
    users, shifts, loading, saving, error, dirty, blocked,
    load: loadData, applyTimes: editTimes, moveShift: relocateShift, save: persist, discardChanges,
} = useSchedule(() => props.endpoint, range);
const {
    selected, replace: replaceSelection, clear: clearSelection, toggle: toggleSelection, start: startSelection, enter: enterSelection,
} = useCellSelection(blocked, applyTimes);

const search = ref('');
const toast = ref('');
const shiftEditor = ref<InstanceType<typeof ShiftTemplates> | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const visibleUsers = computed(() => {
    const query = search.value.trim().toLocaleLowerCase('ru');

    return users.value.filter(user =>
        `${user.surname} ${user.name} ${user.name} ${user.surname}`.toLocaleLowerCase('ru').includes(query),
    );
});

const assignment = reactive(useShiftAssignment({
    selected,
    replaceSelection,
    users: visibleUsers,
    shifts,
    blocked,
}));

async function load(): Promise<void> {
    if (await loadData()) {
        clearSelection();
    }
}

async function changePeriod(direction: number, nextView: ScheduleView = view.value): Promise<void> {
    if (loading.value || saving.value) {
        return;
    }

    if (dirty.value && !window.confirm('Изменения не сохранены. Перейти к другому периоду и отменить их?')) {
        return;
    }

    discardChanges();
    clearSelection();
    move(direction, nextView);
    await load();
}

function applyTimes(start: string | null, end: string | null): void {
    editTimes(selected.value, start, end);
}

function moveShift(sourceKey: string, targetKey: string): void {
    if (relocateShift(sourceKey, targetKey)) {
        replaceSelection([targetKey]);
    }
}

async function editSelection(): Promise<void> {
    if (assignment.prepareEdit()) {
        await nextTick();
        shiftEditor.value?.focusCustom();
    }
}

function notify(message: string): void {
    toast.value = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.value = ''; }, 4000);
}

async function save(publish: boolean): Promise<void> {
    try {
        if (await persist(publish)) {
            clearSelection();
            notify(publish ? 'График опубликован' : 'Изменения сохранены');
        }
    } catch (cause) {
        notify(cause instanceof Error ? cause.message : 'Не удалось сохранить график.');
    }
}

function beforeUnload(event: BeforeUnloadEvent): void {
    if (dirty.value) {
        event.preventDefault();
        event.returnValue = '';
    }
}

onMounted(() => {
    void load();
    window.addEventListener('beforeunload', beforeUnload);
});

onBeforeUnmount(() => {
    clearTimeout(toastTimer);
    window.removeEventListener('beforeunload', beforeUnload);
});
</script>

<template>
    <main class="main-content flex min-w-0 flex-col">
        <div class="breadcrumb flex items-center gap-3">
            <span class="breadcrumb-icon"><AppIcon name="calendar" :size="24" /></span>
            <span>График смен</span>
        </div>
        <header class="page-header flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <h1>График</h1>

            </div>
            <div class="page-actions flex items-center gap-1">
                <AppButton variant="secondary" :disabled="blocked || !shifts.length" @click="save(true)">
                    {{ saving ? 'Подождите…' : 'Опубликовать' }}
                </AppButton>
                <AppButton :disabled="blocked || !dirty" @click="save(false)">Сохранить</AppButton>
            </div>
        </header>

        <div class="schedule-layout">
            <section class="schedule-card" aria-label="График сотрудников" :aria-busy="loading">
                <ScheduleToolbar
                    v-show="!selected.size"
                    v-model:search="search"
                    :view="view"
                    :period-label="periodLabel"
                    :disabled="loading || saving"
                    @navigate="changePeriod"
                    @change-view="changePeriod(0, $event)"
                />
                <SelectionBar
                    :selected="selected"
                    :disabled="blocked"
                    :has-assignments="assignment.hasAssignments"
                    @apply-template="shiftEditor?.focusTemplates()"
                    @edit="editSelection"
                    @clear="applyTimes(null, null)"
                    @deselect="clearSelection"
                />
                <ScheduleGrid
                    :users="visibleUsers"
                    :total-users="users.length"
                    :shifts="shifts"
                    :days="days"
                    :view="view"
                    :selected="selected"
                    :loading="loading"
                    :saving="saving"
                    :error="error"
                    @retry="load"
                    @select="startSelection"
                    @enter="enterSelection"
                    @toggle="toggleSelection"
                    @select-date="assignment.selectDate"
                    @move-shift="moveShift"
                />
            </section>
            <ShiftTemplates
                ref="shiftEditor"
                v-model:start="assignment.customStart"
                v-model:end="assignment.customEnd"
                :selected-count="selected.size"
                :blocked="blocked"
                :saving="saving"
                @apply="applyTimes"
                @clear="applyTimes(null, null)"
                @deselect="clearSelection"
            />
        </div>
    </main>
    <AppToast :message="toast" @close="toast = ''" />
</template>
