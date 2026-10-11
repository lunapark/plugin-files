import type { TStorage } from "@/storage/types.ts";

export function createOpfsStorage(namespace: string): TStorage {
    async function getFolder() {
        const root = await navigator.storage.getDirectory();
        const plugin = await root.getDirectoryHandle("luna-park-files", { create: true });
        return await plugin.getDirectoryHandle(namespace, { create: true });
    }

    return {
        delete: async (key) => {
            await (await getFolder()).removeEntry(key).catch(ignoreNotFound);
        },
        read: async (key) => {
            const handle = await (await getFolder()).getFileHandle(key).catch(ignoreNotFound);
            return await handle?.getFile();
        },
        write: async (key, file) => {
            const writable = await (await (await getFolder()).getFileHandle(key, { create: true })).createWritable();
            await writable.write(file);
            await writable.close();
        }
    };
}

function ignoreNotFound(error: unknown): undefined {
    if (error instanceof DOMException && error.name === "NotFoundError") {
        return undefined;
    }

    throw error;
}
