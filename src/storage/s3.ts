import { AwsClient } from "aws4fetch";

import type { TStorage } from "@/storage/types.ts";

export type TS3Settings = {
    accessKeyId: string;
    bucket: string;
    endpoint: string;
    pathStyle: boolean;
    prefix: string;
    region: string;
    secretAccessKey: string;
};

export function createS3Storage(settings: TS3Settings, fetcher: typeof fetch = fetch): TStorage {
    const client = new AwsClient({
        accessKeyId: settings.accessKeyId,
        region: settings.region || "auto",
        secretAccessKey: settings.secretAccessKey,
        service: "s3"
    });

    function getUrl(key: string) {
        const endpoint = new URL(settings.endpoint);
        const path = `${ settings.prefix ?? "" }${ key }`;

        if (settings.pathStyle) {
            return `${ endpoint.origin }/${ settings.bucket }/${ path }`;
        }

        return `${ endpoint.protocol }//${ settings.bucket }.${ endpoint.host }/${ path }`;
    }

    async function send(key: string, init: RequestInit) {
        const response = await fetcher(await client.sign(getUrl(key), init));

        if (!response.ok && response.status !== 404) {
            throw new Error(`S3 request failed (${ response.status }): ${ await response.text() }`);
        }

        return response;
    }

    return {
        delete: async (key) => {
            await send(key, { method: "DELETE" });
        },
        read: async (key) => {
            const response = await send(key, { method: "GET" });
            return response.status === 404 ? undefined : await response.blob();
        },
        write: async (key, file) => {
            await send(key, {
                body: new Uint8Array(await file.arrayBuffer()),
                headers: { "Content-Type": file.type || "application/octet-stream" },
                method: "PUT"
            });
        }
    };
}
