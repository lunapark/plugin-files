import { database, env } from "@/env.ts";
import { EEditorStorage, internals } from "@/internals.ts";
import type { TFileRecord } from "@/runtime/config.ts";
import { configureFiles } from "@/runtime/config.ts";
import { createHostStorage } from "@/storage/host.ts";
import { createMemoryStorage } from "@/storage/memory.ts";
import { createOpfsStorage } from "@/storage/opfs.ts";
import { createS3Storage } from "@/storage/s3.ts";
import type { TStorage } from "@/storage/types.ts";
import type { TUsersApi } from "@/users.ts";

const memoryStorage = createMemoryStorage();
const objectUrls = new Map<string, string>();

export function configureEditorRuntime(users: TUsersApi) {
    const files = database.files!.db;

    configureFiles({
        db: {
            delete: (filter) => files.delete(filter),
            find: async (filter) => await files.find(filter) as Array<TFileRecord>,
            insert: async (data) => await files.insert(data) as TFileRecord
        },
        lock: async () => {},
        onCommit: (callback) => env.backend.onCommit(callback),
        onRollback: (callback) => env.backend.onRollback(callback),
        quotas: () => internals.quotas,
        resolveUser: () => users.resolveUser(),
        storage: getEditorStorage,
        transaction: (callback) => callback(),
        url: getObjectUrl
    });
}

export function getEditorStorage(): TStorage {
    const host = env.host?.available ? env.host : undefined;

    switch (internals.editor.storage) {
        case EEditorStorage.Memory:
            return memoryStorage;
        case EEditorStorage.Disk:
            if (!host) {
                throw new Error("Local disk storage is only available in the desktop app. Change the editor storage in the Files settings.");
            }
            return createHostStorage(host, () => internals.editor.disk.folder);
        case EEditorStorage.S3:
            if (!host) {
                throw new Error("S3 storage is only available in the desktop app. Change the editor storage in the Files settings.");
            }
            return createS3Storage(internals.editor.s3, host.fetch);
        default:
            return createOpfsStorage((env.app.tree as { id?: string; }).id ?? env.app.name);
    }
}

async function getObjectUrl(record: TFileRecord) {
    const cached = objectUrls.get(record.id);

    if (cached) {
        return cached;
    }

    const content = await getEditorStorage().read(record.id);

    if (!content) {
        throw new Error("File content not found.");
    }

    const url = URL.createObjectURL(new File([content], record.name, { type: record.type }));
    objectUrls.set(record.id, url);
    return url;
}
