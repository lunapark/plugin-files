import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { TStorage } from "@/storage/types.ts";

export function createDiskStorage(folder: string): TStorage {
    const root = path.resolve(folder);

    function getPath(key: string) {
        if (!/^[\w-]+$/.test(key)) {
            throw new Error(`Invalid file key: ${ key }`);
        }

        return path.join(root, key);
    }

    return {
        delete: async (key) => {
            await rm(getPath(key), { force: true });
        },
        read: async (key) => {
            try {
                return new Blob([await readFile(getPath(key))]);
            }
            catch (error) {
                if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                    return undefined;
                }
                throw error;
            }
        },
        write: async (key, file) => {
            await mkdir(root, { recursive: true });
            await writeFile(getPath(key), new Uint8Array(await file.arrayBuffer()));
        }
    };
}
