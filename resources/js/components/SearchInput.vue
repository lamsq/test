<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from './AppIcon.vue';

const model = defineModel<string>({ required: true });

withDefaults(defineProps<{ color?: 'gray' | 'white'; label?: string }>(), {
    color: 'gray',
    label: 'Поиск по ФИО',
});

const input = ref<HTMLInputElement | null>(null);

function clear(): void {
    model.value = '';
    input.value?.focus();
}
</script>

<template>
    <div class="search-field" :class="`search-field--${color}`">
        <label class="search-body">
            <span class="search-icon"><AppIcon name="search" :size="16" /></span>
            <input ref="input" v-model="model" type="search" :placeholder="label" :aria-label="label" />
        </label>
        <button v-if="model" type="button" class="search-clear" aria-label="Очистить поиск" @click="clear">
            <AppIcon name="close" :size="14" />
        </button>
    </div>
</template>

<style scoped>
.search-field {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    flex: 1 1 240px;
    gap: 10px;
    width: 398px;
    max-width: 398px;
    min-width: 0;
    height: 48px;
    padding: 12px;
    border-radius: 12px;
    font-family: 'Manrope', Arial, sans-serif;
}

.search-field--gray { background: #f2f3f7; }
.search-field--white { background: #fff; }

.search-field:hover { box-shadow: inset 0 0 0 1px #bcbcc2; }
.search-field:focus-within { outline: 2px solid #5b7dec; outline-offset: 2px; }

.search-body {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 10px;
    min-width: 0;
}

.search-icon, .search-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
}

.search-icon { color: #93939c; }

input {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 24px;
    padding: 0;
    color: #101012;
    background: transparent;
    border: 0;
    border-radius: 0;
    font: inherit;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
}

input::placeholder { color: #737378; opacity: 1; }
input:focus-visible { outline: none; }
input::-webkit-search-cancel-button { appearance: none; }

.search-clear {
    padding: 0;
    color: #707176;
    background: transparent;
    border: 0;
    border-radius: 4px;
}

.search-clear:hover { background: #e7e8ee; }
</style>
