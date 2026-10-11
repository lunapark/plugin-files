import type { TStorage } from "@/storage/types.ts";

export type TFileRecord = {
    created_at?: Date | string;
    id: string;
    name: string;
    owner: string | null;
    public: boolean;
    size: number;
    type: string;
};

export type TQuota = {
    maxFiles: number | null;
    maxFileSize: number | null;
    maxTotalSize: number | null;
};

export type TQuotas = {
    default: TQuota;
    roles: Record<string, TQuota>;
};

export type TFilesUser = {
    id: string;
    roles: Array<string>;
};

export type TFilesRuntimeOptions = {
    db: {
        delete: (filter: Record<string, unknown>) => Promise<unknown>;
        find: (filter: Record<string, unknown>) => Promise<Array<TFileRecord>>;
        insert: (data: Record<string, unknown>) => Promise<TFileRecord>;
    };
    lock: (key: string) => Promise<void>;
    onCommit: (callback: () => Promise<void> | void) => Promise<void>;
    onRollback: (callback: () => Promise<void> | void) => void;
    quotas: () => TQuotas;
    resolveUser: () => Promise<TFilesUser>;
    storage: () => TStorage;
    transaction: <TResult>(callback: () => Promise<TResult>) => Promise<TResult>;
    url: (file: TFileRecord, expiresIn: number) => Promise<string>;
};

let runtime: TFilesRuntimeOptions | undefined;

export function configureFiles(options: TFilesRuntimeOptions) {
    runtime = options;
}

export function getRuntime() {
    if (!runtime) {
        throw new Error("Files plugin runtime is not configured.");
    }

    return runtime;
}
