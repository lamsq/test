<script setup lang="ts">
import { ref } from 'vue';
import AppSidebar from './AppSidebar.vue';

defineProps<{ page: 'home' | 'shifts'; homeUrl: string; shiftsUrl: string }>();

const collapsed = ref(false);
</script>

<template>
    <div class="workspace" :class="{ 'sidebar-collapsed': collapsed }">
        <AppSidebar
            :page="page"
            :home-url="homeUrl"
            :shifts-url="shiftsUrl"
            :collapsed="collapsed"
            @toggle="collapsed = !collapsed"
        />
        <slot />
    </div>
</template>
