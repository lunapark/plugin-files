<template>
    <div class="s3-form">
        <div class="row">
            <LInput
                v-model="settings.endpoint"
                label="Endpoint"
                placeholder="https://s3.eu-west-3.amazonaws.com"
            />
            <LInput
                v-model="settings.region"
                label="Region"
                placeholder="auto"
            />
        </div>
        <div class="row">
            <LInput
                v-model="settings.bucket"
                label="Bucket"
                placeholder="my-bucket"
            />
            <LInput
                v-model="settings.prefix"
                label="Key prefix"
                placeholder="files/"
            />
        </div>
        <div class="row">
            <LInput
                v-model="settings.accessKeyId"
                label="Access key ID"
            />
            <LInput
                v-model="settings.secretAccessKey"
                label="Secret access key"
                placeholder="********"
                type="password"
            />
        </div>
        <label class="checkbox">
            <LCheckbox v-model="settings.pathStyle" />
            Path-style URLs (needed by MinIO and most S3-compatible providers)
        </label>
    </div>
</template>

<script setup lang="ts">
import { LCheckbox, LInput } from "@luna-park/design";

import type { TS3Settings } from "@/storage/s3.ts";

defineProps<{
    settings: TS3Settings;
}>();
</script>

<style scoped>
.s3-form {
    display: flex;
    flex-direction: column;
    gap: var(--length-xs);

    .row {
        display: flex;
        gap: var(--length-xs);

        &:deep(.input) {
            flex: 1 1 0;
        }
    }

    .checkbox {
        display: flex;
        align-items: center;
        gap: var(--length-xs);
        font-size: var(--font-size-s);
        color: var(--color-content-lite);
    }
}
</style>
