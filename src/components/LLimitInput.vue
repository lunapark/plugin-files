<template>
    <LInput
        v-model="value"
        :disabled="disabled"
        :placeholder="disabled ? '' : 'Unlimited'"
        small
    />
</template>

<script setup lang="ts">
import { LInput } from "@luna-park/design";
import { computed } from "vue";

defineProps<{
    disabled?: boolean;
}>();

const model = defineModel<number | null>({ required: true });

const value = computed({
    get: () => model.value ?? "",
    set: (input: string | number) => {
        const number = Number(input);
        model.value = input === "" || !Number.isFinite(number) ? null : Math.max(0, number);
    }
});
</script>
