<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Employee } from '../types/schedule';

const props = defineProps<{ employee: Employee; hours: string }>();
const photoFailed = ref(false);

const photoUrl = computed(() => {
    if (!props.employee.photo || photoFailed.value) {
        return undefined;
    }

    try {
        const url = new URL(props.employee.photo, `${window.location.origin}/`);

        if (url.origin === window.location.origin || url.protocol === 'https:') {
            return url.href;
        }
    } catch {
        return undefined;
    }
});

watch(() => props.employee.photo, () => { photoFailed.value = false; });
</script>

<template>
    <div class="employee">
        <img v-if="photoUrl" :src="photoUrl" alt="" class="avatar" @error="photoFailed = true" />
        <span v-else class="avatar avatar-initials" aria-hidden="true">
            {{ employee.name.charAt(0) }}{{ employee.surname.charAt(0) }}
        </span>
        <span class="employee-content">
            <span class="employee-name" :title="`${employee.surname} ${employee.name}`">{{ employee.surname }} {{ employee.name }}</span>
            <span class="employee-meta">{{ hours }} ч</span>
        </span>
    </div>
</template>

<style scoped>
.employee {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 72px;
    padding: 12px 12px 12px 8px;
    font-family: 'Manrope', Arial, sans-serif;
}

.avatar {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    object-fit: cover;
    background: #e7e8ee;
    border: 0.5px solid #f2f3f7;
    border-radius: 4px;
}

.avatar-initials {
    background: linear-gradient(180deg, rgb(255 255 255 / 50%), rgb(255 255 255 / 0%)), #3e87ff;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
}

.employee-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
}

.employee-name {
    overflow: hidden;
    color: #000;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.employee-meta {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    color: #737378;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
}
</style>
