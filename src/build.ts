import type { TEnv } from "@luna-park/plugin";
import { EInjectionKey } from "@luna-park/plugin";

import type { TInternals } from "@/internals.ts";
import { EProductionStorage } from "@/internals.ts";
import { serverTarget } from "@/nodes/index.ts";

import packageDefinition from "../package.json" with { type: "json" };

const envKeys = {
    diskFolder: "FILES_DISK_FOLDER",
    publicUrl: "FILES_PUBLIC_URL",
    s3Secret: "FILES_S3_SECRET_ACCESS_KEY"
};

export const backImports = [{ name: packageDefinition.name, version: packageDefinition.version }];

export function getEnv({ internals }: TEnv<never, TInternals>) {
    const { production } = internals;

    return {
        [envKeys.publicUrl]: "",
        ...(production.storage === EProductionStorage.Disk ? { [envKeys.diskFolder]: production.disk.folder } : {}),
        ...(production.storage === EProductionStorage.S3 ? { [envKeys.s3Secret]: production.s3.secretAccessKey } : {})
    };
}

function getStorageCode({ production }: TInternals) {
    switch (production.storage) {
        case EProductionStorage.Disk:
            return {
                name: "createDiskStorage",
                code: `filesCreateDiskStorage(process.env.${ envKeys.diskFolder } || ${ JSON.stringify(production.disk.folder) })`
            };
        case EProductionStorage.S3:
            return {
                name: "createS3Storage",
                code: `filesCreateS3Storage({ ...${ JSON.stringify({ ...production.s3, secretAccessKey: "" }) }, secretAccessKey: process.env.${ envKeys.s3Secret } })`
            };
        default:
            return {
                name: "createPostgresStorage",
                code: "filesCreatePostgresStorage((text, values) => filesGetExecutor().query(text, values))"
            };
    }
}

export function getInjections({ internals }: TEnv<never, TInternals>) {
    const storage = getStorageCode(internals);

    // language=JavaScript
    const serverImport = `
import { configureFiles as filesConfigure, ${ storage.name } as files${ storage.name[0].toUpperCase() }${ storage.name.slice(1) }, deleteUserFiles as filesDeleteUserFiles, serveFile as filesServeFile, signFileUrl as filesSignFileUrl } from "${ serverTarget }";
import { onUserDelete as filesOnUserDelete, resolveUser as filesResolveUser } from "@luna-park/plugin-users/server";
import { dbDelete as filesDbDelete, dbFind as filesDbFind, dbInsert as filesDbInsert, dbTransaction as filesDbTransaction, getExecutor as filesGetExecutor, onCommit as filesOnCommit, onRollback as filesOnRollback, withoutDbScopes as filesWithoutDbScopes } from "@/database/index.js";
`;

    // language=JavaScript
    const serverBody = `
const filesTable = ${ JSON.stringify(internals.files["files-db"]) };
const filesStorage = ${ storage.code };
const filesUrlBase = (process.env.${ envKeys.publicUrl } ?? "") + serverConfig.prefix + "/_files/";

filesConfigure({
    db: {
        delete: (filter) => filesWithoutDbScopes(() => filesDbDelete(filesTable, filter)),
        find: (filter) => filesWithoutDbScopes(() => filesDbFind(filesTable, filter)),
        insert: (data) => filesWithoutDbScopes(() => filesDbInsert(filesTable, data))
    },
    lock: async (key) => {
        await filesGetExecutor().query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
    },
    onCommit: filesOnCommit,
    onRollback: filesOnRollback,
    quotas: () => (${ JSON.stringify(internals.quotas) }),
    resolveUser: filesResolveUser,
    storage: () => filesStorage,
    transaction: filesDbTransaction,
    url: async (file, expiresIn) => {
        if (file.public) {
            return filesUrlBase + file.id;
        }
        const expires = Math.floor(Date.now() / 1000) + expiresIn;
        return filesUrlBase + file.id + "?expires=" + expires + "&signature=" + await filesSignFileUrl(serverConfig.secret, file.id, expires);
    }
});

filesOnUserDelete(filesDeleteUserFiles);

await server.register(async (files) => {
    files.get("/_files/:id", (request, reply) => filesServeFile(request, reply, serverConfig.secret));
}, { prefix: serverConfig.prefix });
`;

    return {
        [EInjectionKey.ServerImport]: serverImport,
        [EInjectionKey.ServerBody]: serverBody
    };
}
