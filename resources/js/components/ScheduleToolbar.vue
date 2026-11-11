<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import SearchInput from './SearchInput.vue';
import type { ScheduleView } from '../types/schedule';

const search = defineModel<string>('search', { required: true });

defineProps<{ view: ScheduleView; periodLabel: string; disabled: boolean }>();
defineEmits<{ navigate: [direction: number]; changeView: [view: ScheduleView] }>();
</script>

<template>
    <div class="toolbar flex flex-wrap items-center gap-2">
        <SearchInput v-model="search" />
        <div class="view-switch flex" aria-label="Вид графика">
            <button
                :class="{ selected: view === 'month' }"
                :aria-pressed="view === 'month'"
                :disabled="disabled" @click="$emit('changeView', 'month')">
                Месяц
            </button>
            <button
                :class="{ selected: view === 'week' }"
                :aria-pressed="view === 'week'"
                :disabled="disabled"
                @click="$emit('changeView', 'week')">
                Неделя
            </button>
        </div>
        <div class="date-navigation flex items-center gap-1">
            <button
                class="icon-button"
                aria-label="Прошлый период"
                :disabled="disabled" @click="$emit('navigate', -1)"
            >
                <AppIcon name="left" :size="20" />
            </button>
            <span>{{ periodLabel }}</span>
            <button
                class="icon-button"
                aria-label="Следующий период"
                :disabled="disabled"
                @click="$emit('navigate', 1)"
            >
                <AppIcon name="right" :size="20" />
            </button>
        </div>
    </div>
</template>
