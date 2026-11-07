<template>
    <LCard class="limit-settings">
        <table>
            <thead>
                <tr>
                    <th class="role">
                        Role
                    </th>
                    <th>Files</th>
                    <th>File size (MB)</th>
                    <th>Total size (MB)</th>
                    <th class="custom">
                        Custom
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th class="role">
                        Default
                    </th>
                    <td><LLimitInput v-model="internals.quotas.default.maxFiles" /></td>
                    <td><LLimitInput v-model="internals.quotas.default.maxFileSize" /></td>
                    <td><LLimitInput v-model="internals.quotas.default.maxTotalSize" /></td>
                    <td />
                </tr>
                <tr
                    v-for="role in roles"
                    :key="role.id"
                >
                    <th class="role">
                        {{ role.label }}
                    </th>
                    <template v-if="internals.quotas.roles[role.id]">
                        <td><LLimitInput v-model="internals.quotas.roles[role.id]!.maxFiles" /></td>
                        <td><LLimitInput v-model="internals.quotas.roles[role.id]!.maxFileSize" /></td>
                        <td><LLimitInput v-model="internals.quotas.roles[role.id]!.maxTotalSize" /></td>
                    </template>
                    <template v-else>
                        <td>
                            <LLimitInput
                                v-model="internals.quotas.default.maxFiles"
                                disabled
                            />
                        </td>
                        <td>
                            <LLimitInput
                                v-model="internals.quotas.default.maxFileSize"
                                disabled
                            />
                        </td>
                        <td>
                            <LLimitInput
                                v-model="internals.quotas.default.maxTotalSize"
                                disabled
                            />
                        </td>
                    </template>
                    <td class="custom">
                        <LCheckbox
                            class="checkbox"
                            :model-value="!!internals.quotas.roles[role.id]"
                            @update:model-value="setCustom(role.id, $event)"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </LCard>
</template>

<script setup lang="ts">
import { LCard, LCheckbox } from "@luna-park/design";
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
    overflow-x: auto;

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        padding: var(--length-xxs) var(--length-xs);
        border-bottom: 1px solid var(--color-background-2);
        font-size: var(--font-size-s);
        font-weight: normal;
        text-align: left;
    }

    tbody tr:last-child th,
    tbody tr:last-child td {
        border-bottom: none;
    }

    thead th {
        font-size: var(--font-size-xs);
        color: var(--color-content-liter);
    }

    td {
        width: 8rem;
        min-width: 6rem;
    }

    .role {
        padding-left: var(--length-s);
        color: var(--color-content);
    }

    .custom {
        width: 1%;
        padding-right: var(--length-s);
        text-align: center;
        white-space: nowrap;

        .checkbox {
            margin-inline: auto;
        }
    }
}
</style>
