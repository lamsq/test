<script setup lang="ts">
import { formatNumber, shiftHours, shiftTemplates } from '../utils/schedule';

defineProps<{ disabled: boolean }>();
defineEmits<{ apply: [start: string, end: string] }>();
</script>

<template>
    <div class="flex flex-col gap-1">
        <button
            type="button"
            v-for="(preset, index) in shiftTemplates"
            :key="preset.name"
            class="preset-button"
            :class="`shift-tone-${preset.tone}`"
            :disabled="disabled"
            @click="$emit('apply', preset.start, preset.end)"
        >
            <span class="preset-content">
                <strong>{{ preset.name }}</strong>
                <span class="preset-details">
                    <span>{{ preset.start }}–{{ preset.end }}</span>
                    <span aria-hidden="true">·</span>
                    <span>{{ formatNumber(shiftHours(preset.start, preset.end)) }} ч</span>
                </span>
            </span>
            <kbd>{{ index + 1 }}</kbd>
        </button>
    </div>
</template>

<style scoped>
.preset-button {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
    height: 64px;
    padding: 8px 8px 8px 16px;
    color: #000;
    background: #f2f3f7;
    border: 0;
    border-left: 3px solid var(--preset-border);
    border-radius: 8px;
    font-family: 'Manrope', Arial, sans-serif;
    text-align: left;
}

.preset-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
}

.preset-content strong {
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
}

.preset-details {
    display: flex;
    gap: 4px;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.preset-button kbd {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-width: 22px;
    height: 20px;
    padding: 2px 8px;
    color: #101012;
    background: #fff;
    border-radius: 4px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
}

.preset-button:hover:not(:disabled) {
    background: #e9ebf4;
}
</style>
