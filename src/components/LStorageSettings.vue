<template>
    <div class="storage-settings">
        <h2>Editor</h2>
        <span class="description">
            Where files are stored while you build and preview your app.
        </span>
        <LDropdown
            v-model="internals.editor.storage"
            label="Storage"
            :options="editorOptions"
        />
        <LInput
            v-if="internals.editor.storage === EEditorStorage.Disk"
            v-model="internals.editor.disk.folder"
            label="Folder (relative to the project)"
            placeholder=".storage/files"
        />
        <LS3Form
            v-if="internals.editor.storage === EEditorStorage.S3"
            :settings="internals.editor.s3"
        />
        <span
            v-if="!desktop"
            class="description"
        >
            Local disk and S3 storage are only available in the desktop app.
        </span>

        <h2>Production</h2>
        <span class="description">
            Where your deployed app stores files. Secrets are written to the project's <code>.env</code>, never to the generated code.
        </span>
        <LDropdown
            v-model="internals.production.storage"
            label="Storage"
            :options="productionOptions"
        />
        <span
            v-if="internals.production.storage === EProductionStorage.Postgres"
            class="description"
        >
            Files are stored in the app's database: nothing else to set up, and they are included in your database backups. Best for small files.
        </span>
        <template v-if="internals.production.storage === EProductionStorage.Disk">
            <LInput
                v-model="internals.production.disk.folder"
                label="Folder (relative to the backend)"
                placeholder="storage"
            />
            <span class="description">
                The server needs a persistent disk (a Docker volume, for example). Change it later with <code>FILES_DISK_FOLDER</code>.
            </span>
        </template>
        <LS3Form
            v-if="internals.production.storage === EProductionStorage.S3"
            :settings="internals.production.s3"
        />
    </div>
</template>

<script setup lang="ts">
import { faCloud, faDatabase, faHardDrive, faMemory, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { LDropdown, LInput } from "@luna-park/design";
import { computed } from "vue";

import LS3Form from "@/components/LS3Form.vue";
import { env } from "@/env.ts";
import { EEditorStorage, EProductionStorage, internals } from "@/internals.ts";

const desktop = computed(() => !!env.host?.available);

const editorOptions = computed(() => [
    { id: EEditorStorage.Opfs, description: "Kept in this browser (OPFS)", icon: { icon: faWindowMaximize }, label: "Browser storage" },
    { id: EEditorStorage.Memory, description: "Cleared when the editor reloads", icon: { icon: faMemory }, label: "In memory" },
    { id: EEditorStorage.Disk, description: "In the project folder", disabled: !desktop.value, icon: { icon: faHardDrive }, label: "Local disk" },
    { id: EEditorStorage.S3, description: "AWS, Cloudflare R2, MinIO…", disabled: !desktop.value, icon: { icon: faCloud }, label: "S3-compatible" }
]);

const productionOptions = [
    { id: EProductionStorage.Postgres, description: "In the app's PostgreSQL database", icon: { icon: faDatabase }, label: "Database" },
    { id: EProductionStorage.Disk, description: "On the server", icon: { icon: faHardDrive }, label: "Local disk" },
    { id: EProductionStorage.S3, description: "AWS, Cloudflare R2, MinIO…", icon: { icon: faCloud }, label: "S3-compatible" }
];
</script>

<style scoped>
.storage-settings {
    padding: var(--length-s);
    display: flex;
    flex-direction: column;
    gap: var(--length-xs);

    h2 {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        font-weight: 600;
        color: var(--color-content-liter);
        margin: var(--length-s) 0 0;

        &:first-child {
            margin-top: 0;
        }
    }

    .description {
        color: var(--color-content-litest);
        font-size: var(--font-size-s);
    }
}
</style>
