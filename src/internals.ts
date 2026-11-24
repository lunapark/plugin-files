import { reactive } from "vue";

import type { TQuotas } from "@/runtime/config.ts";
import type { TS3Settings } from "@/storage/s3.ts";

export const EEditorStorage = {
    Disk: "disk",
    Memory: "memory",
    Opfs: "opfs",
    S3: "s3"
} as const;

export type EEditorStorage = typeof EEditorStorage[keyof typeof EEditorStorage];

export const EProductionStorage = {
    Disk: "disk",
    Postgres: "postgres",
    S3: "s3"
} as const;

export type EProductionStorage = typeof EProductionStorage[keyof typeof EProductionStorage];

export type TS3SecretlessSettings = Omit<TS3Settings, "secretAccessKey"> & { secretAccessKey?: string; };

export type TInternals = {
    editor: {
        disk: { folder: string; };
        s3: TS3SecretlessSettings;
        storage: EEditorStorage;
    };
    files: Record<string, string>;
    production: {
        disk: { folder: string; };
        s3: TS3SecretlessSettings;
        storage: EProductionStorage;
    };
    quotas: TQuotas;
};

export function getDefaultS3Settings(): TS3SecretlessSettings {
    return {
        accessKeyId: "",
        bucket: "",
        endpoint: "",
        pathStyle: true,
        prefix: "",
        region: "auto"
    };
}

export const internals = reactive<TInternals>({
    editor: {
        disk: { folder: ".storage/files" },
        s3: getDefaultS3Settings(),
        storage: EEditorStorage.Opfs as EEditorStorage
    },
    files: {},
    production: {
        disk: { folder: "storage" },
        s3: getDefaultS3Settings(),
        storage: EProductionStorage.Postgres as EProductionStorage
    },
    quotas: {
        default: { maxFiles: null, maxFileSize: 8, maxTotalSize: 64 },
        roles: {
            anonymous: { maxFiles: 0, maxFileSize: 8, maxTotalSize: 64 }
        }
    }
});
