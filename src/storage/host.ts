import type { THost } from "@luna-park/plugin";

import type { TStorage } from "@/storage/types.ts";

export function createHostStorage(host: THost, folder: () => string): TStorage {
    function getPath(key: string) {
        return `${ folder().replace(/[/\\]+$/, "") }/${ key }`;
    }

    return {
        delete: async (key) => {
            await host.removeFile(getPath(key));
        },
        read: async (key) => {
            const data = await host.readFile(getPath(key));
            return data && new Blob([data as Uint8Array<ArrayBuffer>]);
        },
        write: async (key, file) => {
            await host.writeFile(getPath(key), new Uint8Array(await file.arrayBuffer()));
        }
    };
}
