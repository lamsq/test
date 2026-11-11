<script setup lang="ts">
import AppIcon from './AppIcon.vue';

defineProps<{ message: string }>();
defineEmits<{ close: [] }>();
</script>

<template>
    <div v-if="message" class="toast flex items-center gap-2" role="status">
        <span>{{ message }}</span>
        <button class="icon-button" aria-label="Закрыть уведомление" @click="$emit('close')">
            <AppIcon name="close" :size="20" />
        </button>
    </div>
</template>
