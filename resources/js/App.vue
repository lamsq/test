<script setup lang="ts">
import AppLayout from './components/AppLayout.vue';
import HomePage from './HomePage.vue';
import SchedulePage from './SchedulePage.vue';

withDefaults(defineProps<{
    endpoint?: string;
    page?: 'home' | 'shifts';
    homeUrl?: string;
    shiftsUrl?: string;
}>(), {
    endpoint: '/schedule',
    page: 'shifts',
    homeUrl: '/',
    shiftsUrl: '/shifts',
});
</script>

<template>
    <AppLayout :page="page" :home-url="homeUrl" :shifts-url="shiftsUrl">
        <HomePage v-if="page === 'home'" />
        <SchedulePage v-else :endpoint="endpoint" />
    </AppLayout>
</template>
