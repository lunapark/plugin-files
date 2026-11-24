<template>
    <div class="s3-form">
        <div class="fields">
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
            <LInput
                v-model="settings.accessKeyId"
                label="Access key ID"
            />
            <LSecretInput
                label="Secret access key"
                :name="secretName"
                placeholder="********"
                :secrets="secrets"
            />
        </div>
        <LSettingRow
            description="Needed by MinIO and most S3-compatible providers."
            title="Path-style URLs"
        >
            <LSwitch
                v-model="settings.pathStyle"
                small
            />
        </LSettingRow>
    </div>
</template>

<script setup lang="ts">
import { LInput, LSettingRow, LSwitch } from "@luna-park/design";
import { LSecretInput } from "@luna-park/plugin/components";
import { computed } from "vue";

import { env } from "@/env.ts";
import type { TS3SecretlessSettings } from "@/internals.ts";

defineProps<{
    secretName: string;
    settings: TS3SecretlessSettings;
}>();

const secrets = computed(() => env.secrets);
</script>

<style scoped>
.s3-form {
    border-top: 1px solid var(--color-background-2);

    .fields {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--length-s);
        padding: var(--length-s);
        border-bottom: 1px solid var(--color-background-2);
    }
}
</style>
