<template>
    <div class="limit-settings">
        <h2>Limits per role</h2>
        <span class="description">
            Limits apply to the connected user when a file is saved. A user with several roles gets the most generous limit of each kind. Leave a field empty for no limit.
            Uploads are also capped by the server's <code>UPLOAD_MAX_SIZE</code> (10 MB by default).
        </span>
        <div class="grid">
            <span class="header">Role</span>
            <span class="header">Files</span>
            <span class="header">File size (MB)</span>
            <span class="header">Total size (MB)</span>
            <span class="header">Custom</span>

            <span class="role">Default</span>
            <LLimitInput v-model="internals.quotas.default.maxFiles" />
            <LLimitInput v-model="internals.quotas.default.maxFileSize" />
            <LLimitInput v-model="internals.quotas.default.maxTotalSize" />
            <span />

            <template
                v-for="role in roles"
                :key="role.id"
            >
                <span class="role">{{ role.label }}</span>
                <template v-if="internals.quotas.roles[role.id]">
                    <LLimitInput v-model="internals.quotas.roles[role.id]!.maxFiles" />
                    <LLimitInput v-model="internals.quotas.roles[role.id]!.maxFileSize" />
                    <LLimitInput v-model="internals.quotas.roles[role.id]!.maxTotalSize" />
                </template>
                <template v-else>
                    <LLimitInput
                        v-model="internals.quotas.default.maxFiles"
                        disabled
                    />
                    <LLimitInput
                        v-model="internals.quotas.default.maxFileSize"
                        disabled
                    />
                    <LLimitInput
                        v-model="internals.quotas.default.maxTotalSize"
                        disabled
                    />
                </template>
                <LCheckbox
                    :model-value="!!internals.quotas.roles[role.id]"
                    @update:model-value="setCustom(role.id, $event)"
                />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LCheckbox } from "@luna-park/design";
import { computed } from "vue";

import LLimitInput from "@/components/LLimitInput.vue";
import { internals } from "@/internals.ts";
import { usersApi } from "@/users.ts";

const roles = computed(() => usersApi.value?.roles() ?? []);

function setCustom(roleId: string, custom: boolean) {
    if (custom) {
        internals.quotas.roles[roleId] = { ...internals.quotas.default };
    }
    else {
        delete internals.quotas.roles[roleId];
    }
}
</script>

<style scoped>
.limit-settings {
    padding: var(--length-s);
    display: flex;
    flex-direction: column;
    gap: var(--length-xs);

    h2 {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        font-weight: 600;
        color: var(--color-content-liter);
        margin: 0;
    }

    .description {
        color: var(--color-content-litest);
        font-size: var(--font-size-s);
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr repeat(3, 8rem) auto;
        align-items: center;
        gap: var(--length-xs);
    }

    .header {
        font-size: var(--font-size-xs);
        color: var(--color-content-liter);
    }

    .role {
        font-size: var(--font-size-s);
        color: var(--color-content-lite);
    }
}
</style>
