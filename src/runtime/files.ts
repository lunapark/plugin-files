import { httpError } from "@luna-park/http-errors";

import type { TFileRecord } from "@/runtime/config.ts";
import { getRuntime } from "@/runtime/config.ts";
import { getQuota, megabyte } from "@/runtime/quota.ts";

export type TSaveOptions = {
    public?: boolean;
};

export async function saveFile(file: Blob, options: TSaveOptions = {}): Promise<TFileRecord> {
    const { db, lock, onRollback, quotas, resolveUser, storage, transaction } = getRuntime();
    const user = await resolveUser();
    const owner = user.id || null;
    const quota = getQuota(user.roles, quotas());

    if (quota.maxFileSize !== null && file.size > quota.maxFileSize * megabyte) {
        throw httpError.PayloadTooLarge(`Files are limited to ${ quota.maxFileSize } MB.`);
    }

    return await transaction(async () => {
        await lock(`files:${ owner ?? "anonymous" }`);

        const usage = await getUsage(owner);

        if (quota.maxFiles !== null && usage.count >= quota.maxFiles) {
            throw httpError.Forbidden(quota.maxFiles ? `You can't store more than ${ quota.maxFiles } files.` : "You are not allowed to store files.");
        }

        if (quota.maxTotalSize !== null && usage.size + file.size > quota.maxTotalSize * megabyte) {
            throw httpError.PayloadTooLarge(`Your files are limited to ${ quota.maxTotalSize } MB in total.`);
        }

        const record = await db.insert({
            name: file instanceof File ? file.name : "file",
            owner,
            public: !!options.public,
            size: file.size,
            type: file.type
        });

        onRollback(() => storage().delete(record.id));

        try {
            await storage().write(record.id, file);
        }
        catch (error) {
            await db.delete({ id: record.id });
            throw error;
        }

        return record;
    });
}

export async function getFileRecord(id: string) {
    const record = (await getRuntime().db.find({ id }))[0];

    if (!record) {
        throw httpError.NotFound("File not found.");
    }

    return record;
}

export async function readFile(id: string) {
    const record = await getFileRecord(id);
    const content = await getRuntime().storage().read(record.id);

    if (!content) {
        throw httpError.NotFound("File content not found.");
    }

    return new File([content], record.name, { type: record.type });
}

export async function deleteFile(id: string) {
    const { db, onCommit, storage } = getRuntime();
    const record = await getFileRecord(id);

    await db.delete({ id: record.id });
    await onCommit(() => storage().delete(record.id));
}

export async function deleteUserFiles(userId: string) {
    for (const record of await getRuntime().db.find({ owner: userId })) {
        await deleteFile(record.id);
    }
}

export async function getFileUrl(id: string, expiresIn = 3600) {
    return await getRuntime().url(await getFileRecord(id), expiresIn);
}

export async function getUsage(owner: string | null) {
    const records = await getRuntime().db.find({ owner });

    return {
        count: records.length,
        size: records.reduce((total, record) => total + Number(record.size), 0)
    };
}

export async function getCurrentUsage() {
    const { quotas, resolveUser } = getRuntime();
    const user = await resolveUser();
    const usage = await getUsage(user.id || null);

    return { ...usage, quota: getQuota(user.roles, quotas()) };
}
