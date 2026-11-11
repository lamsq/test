<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from './AppIcon.vue';

defineProps<{
    page: 'home' | 'shifts';
    homeUrl: string;
    shiftsUrl: string;
    collapsed: boolean;
}>();

defineEmits<{ toggle: [] }>();

const notificationsOpen = ref(false);
</script>

<template>
    <aside class="sidebar flex flex-col">
        <div class="brand-row flex items-center justify-between">
            <a :href="homeUrl" class="brand" aria-label="CRM — главная">{{ collapsed ? 'C' : 'CRM' }}</a>
            <div v-if="!collapsed" class="notification-wrap">
                <button
                    class="icon-button"
                    aria-label="Уведомления"
                    :aria-expanded="notificationsOpen"
                    @click="notificationsOpen = !notificationsOpen"
                >
                    <AppIcon name="bell" :size="24" />
                </button>
                <div v-if="notificationsOpen" class="notification-popover">
                    <strong>Уведомления</strong>
                    <p>В разработке...</p>
                </div>
            </div>
        </div>
        <nav class="flex flex-col gap-0.5" aria-label="Основная навигация">
            <a
                :href="homeUrl"
                class="nav-link"
                :class="{ active: page === 'home' }"
                :aria-current="page === 'home' ? 'page' : undefined"
                :title="collapsed ? 'Главная' : undefined"
            >
                <AppIcon name="home" :size="24" />
                <span v-if="!collapsed">Главная</span>
            </a>
            <a
                :href="shiftsUrl"
                class="nav-link"
                :class="{ active: page === 'shifts' }"
                :aria-current="page === 'shifts' ? 'page' : undefined"
                :title="collapsed ? 'Смены' : undefined"
            >
                <AppIcon name="calendar" :size="24" />
                <span v-if="!collapsed">Смены</span>
            </a>
        </nav>
        <button
            class="collapse-button nav-link mt-auto"
            :aria-label="collapsed ? 'Показать меню' : 'Свернуть меню'"
            @click="$emit('toggle')"
        >
            <AppIcon name="panel" :size="24" />
            <span v-if="!collapsed">Свернуть меню</span>
        </button>
    </aside>
</template>
