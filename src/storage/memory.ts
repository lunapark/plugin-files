import type { TStorage } from "@/storage/types.ts";

export function createMemoryStorage(): TStorage {
    const files = new Map<string, Blob>();

    return {
        delete: async (key) => {
            files.delete(key);
        },
        read: async (key) => files.get(key),
        write: async (key, file) => {
            files.set(key, file);
        }
    };
}
