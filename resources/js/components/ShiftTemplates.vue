<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from './AppIcon.vue';
import AppButton from './AppButton.vue';
import ShiftPresetList from './ShiftPresetList.vue';

const props = defineProps<{ selectedCount: number; blocked: boolean; saving: boolean }>();
const emit = defineEmits<{ apply: [start: string, end: string]; clear: []; deselect: [] }>();
const customStart = defineModel<string>('start', { required: true });
const customEnd = defineModel<string>('end', { required: true });
const panel = ref<HTMLElement | null>(null);
const startInput = ref<HTMLInputElement | null>(null);

const timePattern = '([01][0-9]|2[0-3]):[0-5][0-9]';
const timeFormat = new RegExp(`^${timePattern}$`);
const customFormatInvalid = computed(() => !timeFormat.test(customStart.value) || !timeFormat.test(customEnd.value));
const customInvalid = computed(() => customFormatInvalid.value || customEnd.value <= customStart.value);
const disabled = computed(() => !props.selectedCount || props.blocked);

function focusControl(control: HTMLElement | null): void {
    control?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    control?.focus({ preventScroll: true });
}

function focusTemplates(): void {
    focusControl(panel.value?.querySelector<HTMLButtonElement>('.preset-button') ?? null);
}

function focusCustom(): void {
    focusControl(startInput.value);
}

defineExpose({ focusTemplates, focusCustom });

function applyCustom(): void {
    if (!disabled.value && !customInvalid.value) {
        emit('apply', customStart.value, customEnd.value);
    }
}
</script>

<template>
    <aside id="shift-template-panel" ref="panel" class="templates-card" aria-label="Настройка смен">
        <h2>Шаблоны смен</h2>
        <ShiftPresetList :disabled="disabled" @apply="(start, end) => $emit('apply', start, end)" />
        <form class="custom-shift" @submit.prevent="applyCustom">
            <h2>Своя смена</h2>
            <div class="time-fields grid grid-cols-2 gap-2">
                <label>
                    Начало
                    <input
                        ref="startInput"
                        v-model="customStart"
                        type="text"
                        :pattern="timePattern"
                        maxlength="5"
                        placeholder="09:00"
                        :aria-invalid="customFormatInvalid"
                        required
                        aria-label="Начало своей смены"
                    />
                </label>
                <label>
                    Конец
                    <input
                        v-model="customEnd"
                        type="text"
                        :pattern="timePattern"
                        maxlength="5"
                        placeholder="17:00"
                        title="Время в формате ЧЧ:ММ, например 17:00"
                        :aria-invalid="customFormatInvalid"
                        required
                        aria-label="Конец своей смены"
                    />
                </label>
            </div>
            <p v-if="customFormatInvalid" class="field-error">Введите время в формате ЧЧ:ММ (00:00–23:59).</p>
            <p v-else-if="customInvalid" class="field-error">Конец должен быть позже начала.</p>
            <AppButton
                variant="secondary"
                type="submit"
                class="apply-button"
                wrap
                :disabled="disabled || customInvalid"
            >
                <AppIcon name="plus" :size="24" />Поставить в выделенные
            </AppButton>
        </form>
        <div v-if="selectedCount" class="selection-tools">
            <AppButton variant="quaternary" color="neutral" class="clear-shifts" :disabled="saving" wrap @click="$emit('clear')">
                <AppIcon name="trash" :size="24" />Убрать смены
            </AppButton>
            <AppButton variant="quinary" color="neutral" class="deselect-button" wrap @click="$emit('deselect')">Убрать выделение</AppButton>
        </div>
    </aside>
</template>
