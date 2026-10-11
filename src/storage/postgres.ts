import type { TStorage } from "@/storage/types.ts";

type TQuery = (text: string, values?: Array<unknown>) => Promise<{ rows: Array<Record<string, unknown>>; }>;

const table = "\"_files_content\"";

export function createPostgresStorage(query: TQuery): TStorage {
    let ready: Promise<unknown> | undefined;

    async function init() {
        ready ??= query(`CREATE TABLE IF NOT EXISTS ${ table } ("key" text PRIMARY KEY, "data" bytea NOT NULL)`);
        await ready;
    }

    return {
        delete: async (key) => {
            await init();
            await query(`DELETE FROM ${ table } WHERE "key" = $1`, [key]);
        },
        read: async (key) => {
            await init();
            const data = (await query(`SELECT "data" FROM ${ table } WHERE "key" = $1`, [key])).rows[0]?.data as Uint8Array<ArrayBuffer> | undefined;
            return data && new Blob([data]);
        },
        write: async (key, file) => {
            await init();
            await query(`INSERT INTO ${ table } ("key", "data") VALUES ($1, $2) ON CONFLICT ("key") DO UPDATE SET "data" = EXCLUDED."data"`, [key, new Uint8Array(await file.arrayBuffer())]);
        }
    };
}
