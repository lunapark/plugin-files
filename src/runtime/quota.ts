import type { TQuota, TQuotas } from "@/runtime/config.ts";

export const megabyte = 1024 * 1024;

export function getQuota(roles: Array<string>, quotas: TQuotas): TQuota {
    const applied = roles.length ? roles.map((role) => quotas.roles[role] ?? quotas.default) : [quotas.default];

    return {
        maxFiles: getMostGenerous(applied.map((quota) => quota.maxFiles)),
        maxFileSize: getMostGenerous(applied.map((quota) => quota.maxFileSize)),
        maxTotalSize: getMostGenerous(applied.map((quota) => quota.maxTotalSize))
    };
}

function getMostGenerous(values: Array<number | null>) {
    return values.includes(null) ? null : Math.max(...values as Array<number>);
}
