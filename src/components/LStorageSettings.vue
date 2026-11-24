<template>
    <div class="storage-settings">
        <LCard>
            <LSettingRow
                description="Where files are stored while you build and preview your app."
                title="Editor"
            >
                <LDropdown
                    v-model="internals.editor.storage"
                    :options="editorOptions"
                    small
                />
            </LSettingRow>
            <LSettingRow
                v-if="internals.editor.storage === EEditorStorage.Disk"
                description="Relative to the project folder."
                title="Folder"
            >
                <LInput
                    v-model="internals.editor.disk.folder"
                    placeholder=".storage/files"
                    small
                />
            </LSettingRow>
            <LS3Form
                v-if="internals.editor.storage === EEditorStorage.S3"
                :secret-name="secretNames.editorS3Secret"
                :settings="internals.editor.s3"
            />
            <p
                v-if="!desktop"
                class="note"
            >
                Local disk and S3 storage are only available in the desktop app.
            </p>
        </LCard>

        <LCard>
            <LSettingRow
                description="Where your deployed app stores files. Secrets are saved in the project's .env and stay out of the generated code."
                title="Production"
            >
                <LDropdown
                    v-model="internals.production.storage"
                    :options="productionOptions"
                    small
                />
            </LSettingRow>
            <p
                v-if="internals.production.storage === EProductionStorage.Postgres"
                class="note"
            >
                Files are stored in the app's database: nothing else to set up, and they are included in your database backups. Best for small files.
            </p>
            <LSettingRow
                v-if="internals.production.storage === EProductionStorage.Disk"
                description="Relative to the backend. The server needs a persistent disk, such as a Docker volume. Override it with FILES_DISK_FOLDER."
                title="Folder"
            >
                <LInput
                    v-model="internals.production.disk.folder"
                    placeholder="storage"
                    small
                />
            </LSettingRow>
            <LS3Form
                v-if="internals.production.storage === EProductionStorage.S3"
                :secret-name="secretNames.s3Secret"
                :settings="internals.production.s3"
            />
        </LCard>
    </div>
</template>

<script setup lang="ts">
import { faCloud, faDatabase, faHardDrive, faMemory, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { LCard, LDropdown, LInput, LSettingRow } from "@luna-park/design";
import { computed } from "vue";

import LS3Form from "@/components/LS3Form.vue";
import { secretNames } from "@/config.ts";
import { env } from "@/env.ts";
import { EEditorStorage, EProductionStorage, internals } from "@/internals.ts";

const desktop = computed(() => !!env.host?.available);

const editorOptions = computed(() => [
    { description: "Kept in this browser (OPFS)", icon: { icon: faWindowMaximize }, label: "Browser storage", value: EEditorStorage.Opfs },
    { description: "Cleared when the editor reloads", icon: { icon: faMemory }, label: "In memory", value: EEditorStorage.Memory },
    { description: "In the project folder", disabled: !desktop.value, icon: { icon: faHardDrive }, label: "Local disk", value: EEditorStorage.Disk },
    { description: "AWS, Cloudflare R2, MinIO…", disabled: !desktop.value, icon: { icon: faCloud }, label: "S3-compatible", value: EEditorStorage.S3 }
]);

const productionOptions = [
    { description: "In the app's PostgreSQL database", icon: { icon: faDatabase }, label: "Database", value: EProductionStorage.Postgres },
    { description: "On the server", icon: { icon: faHardDrive }, label: "Local disk", value: EProductionStorage.Disk },
    { description: "AWS, Cloudflare R2, MinIO…", icon: { icon: faCloud }, label: "S3-compatible", value: EProductionStorage.S3 }
];
</script>

<style scoped>
.storage-settings {
    display: flex;
    flex-direction: column;
    gap: var(--length-s);

    .note {
        margin: 0;
        padding: var(--length-xs) var(--length-s);
        border-top: 1px solid var(--color-background-2);
        font-size: var(--font-size-xs);
        color: var(--color-content-liter);
    }
}
</style>
