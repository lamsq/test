<script setup lang="ts">
import type { Component } from 'vue';
import {
    Bell,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    House,
    Search,
    Plus,
    PanelLeft,
    Trash2,
    X,
    LayoutGrid,
    Pencil,
} from '@lucide/vue';

withDefaults(defineProps<{ name: string; size?: number }>(), { size: 16 });

const icons: Record<string, Component> = {
    home: House,
    calendar: CalendarDays,
    bell: Bell,
    left: ChevronLeft,
    right: ChevronRight,
    search: Search,
    panel: PanelLeft,
    plus: Plus,
    close: X,
    trash: Trash2,
    check: Check,
    grid: LayoutGrid,
    edit: Pencil,
};
</script>

<template>
    <component
        :is="icons[name] || CalendarDays"
        :size="size"
        :stroke-width="1.5"
        aria-hidden="true"
    />
</template>
