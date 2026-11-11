<script setup lang="ts">
withDefaults(defineProps<{
    variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary';
    color?: 'brand' | 'neutral';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    wrap?: boolean;
}>(), {
    variant: 'primary',
    color: 'brand',
    type: 'button',
    disabled: false,
    wrap: false,
});
</script>

<template>
    <button :type="type" :disabled="disabled" class="button" :class="[`button-${variant}`, `button-${color}`, { 'button--wrap': wrap }]">
        <slot />
    </button>
</template>

<style scoped>
.button {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    max-width: 100%;
    height: 48px;
    padding: 12px 16px;
    border: 0;
    border-radius: 8px;
    font-family: 'Manrope', Arial, sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    text-align: center;
    white-space: nowrap;
}

.button-brand {
    --primary: #5b7dec;
    --primary-hover: #1c4ae5;
    --primary-active: #163bb7;
    --secondary: #e8edfc;
    --secondary-hover: #d2dbfa;
    --secondary-active: #bbc9f7;
    --tertiary-hover: #e8edfc;
    --tertiary-active: #d2dbfa;
    --button-text: #1c4ae5;
    --button-border: #5b7dec;
}

.button-neutral {
    --primary: #242426;
    --primary-hover: #3c3c43;
    --primary-active: #595961;
    --secondary: #f2f3f7;
    --secondary-hover: #e7e8ee;
    --secondary-active: #cdcdd6;
    --tertiary-hover: #f8f9fb;
    --tertiary-active: #e7e8ee;
    --button-text: #101012;
    --button-border: #101012;
}

.button-primary { color: #fff; background: var(--primary); }
.button-primary:hover:not(:disabled) { background: var(--primary-hover); }
.button-primary:active:not(:disabled) { background: var(--primary-active); }
.button-secondary { color: var(--button-text); background: var(--secondary); }
.button-secondary:hover:not(:disabled) { background: var(--secondary-hover); }
.button-secondary:active:not(:disabled) { background: var(--secondary-active); }
.button-tertiary { color: var(--button-text); background: transparent; box-shadow: inset 0 0 0 1px var(--button-border); }
.button-tertiary:hover:not(:disabled) { background: var(--tertiary-hover); }
.button-tertiary:active:not(:disabled) { background: var(--tertiary-active); }
.button-quaternary { color: #101012; background: transparent; box-shadow: inset 0 0 0 1px #dedee3; }
.button-quaternary:hover:not(:disabled) { background: #f8f9fb; }
.button-quaternary:active:not(:disabled) { background: #e7e8ee; }
.button-quinary { color: #101012; background: #fff; border-radius: 11px; }
.button-quinary:hover:not(:disabled) { background: #e7e8ee; }
.button-quinary:active:not(:disabled) { background: #cdcdd6; }

.button:disabled { color: #c1c1c3; background: #f2f3f7; cursor: default; }
.button-primary:disabled { color: #c6c6cd; }
.button-tertiary:disabled { background: transparent; box-shadow: inset 0 0 0 1px #bcbcc2; }
.button-quaternary:disabled { background: transparent; }
.button-quinary:disabled { background: #fff; }
.button--wrap { height: auto; min-height: 48px; white-space: normal; }
.button :deep(svg) { flex-shrink: 0; }
</style>
