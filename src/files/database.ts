import type { TFileDatabase } from "@luna-park/plugin";
import { EElementType, LogicType } from "@luna-park/plugin";

import { database, env } from "@/env.ts";
import { internals } from "@/internals.ts";

export function initFilesDatabase(usersTable: string | undefined) {
    if (!internals.files["files-db"] || !env.getFile(internals.files["files-db"])) {
        const file = env.addFile(getFilesDatabase(usersTable));
        internals.files["files-db"] = file.id;
    }

    database.files = env.getFile(internals.files["files-db"]) as TFileDatabase;
}

function getFilesDatabase(usersTable: string | undefined) {
    return {
        name: "Files",
        data: [],
        schema: LogicType.object({
            id: LogicType.string({ name: "id", options: { freeze: true, readonly: true } }),
            name: LogicType.string({ name: "name", options: { freeze: true } }),
            type: LogicType.string({ name: "type", options: { freeze: true } }),
            size: LogicType.number({ name: "size", options: { freeze: true } }),
            public: LogicType.boolean({ name: "public", options: { freeze: true } }),
            owner: LogicType.string({ name: "owner", options: { foreignKey: true, freeze: true, index: true, onDelete: "setNull" }, target: usersTable }),
            created_at: LogicType.interface("Date", { name: "created_at", options: { freeze: true, readonly: true } }),
            updated_at: LogicType.interface("Date", { name: "updated_at", options: { freeze: true, readonly: true } })
        }, {
            options: { freeze: true, insert: -2 }
        }),
        type: EElementType.Database
    } satisfies Partial<TFileDatabase<true>>;
}
