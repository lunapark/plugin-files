/* eslint-disable sort-keys-custom-order/object-keys */
import { faChartPie, faFileArrowDown, faFileArrowUp, faLink, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ELogicScope, LogicType, makeLogicNode } from "@luna-park/plugin";

import type { TFileRecord, TQuota } from "@/runtime/config.ts";
import { deleteFile, getCurrentUsage, getFileUrl, readFile, saveFile } from "@/runtime/files.ts";

export const serverTarget = "@luna-park/plugin-files/server";

const display = { config: { hue: 200, scope: ELogicScope.Backend } };

export const fileRecordSchema = LogicType.object({
    id: LogicType.string({ name: "id" }),
    name: LogicType.string({ name: "name" }),
    type: LogicType.string({ name: "type" }),
    size: LogicType.number({ name: "size" }),
    public: LogicType.boolean({ name: "public" }),
    owner: LogicType.string({ name: "owner", optional: true })
}, { name: "file" });

function toFileOutput({ id, name, owner, public: isPublic, size, type }: TFileRecord) {
    return { id, name, owner: owner ?? undefined, public: isPublic, size: Number(size), type };
}

function toQuotaOutput(quota: TQuota) {
    return {
        maxFiles: quota.maxFiles ?? undefined,
        maxFileSize: quota.maxFileSize ?? undefined,
        maxTotalSize: quota.maxTotalSize ?? undefined
    };
}

export const nodes = [
    makeLogicNode({
        name: "files/save",
        inputs: {
            in_exec: LogicType.exec(),
            in_file: LogicType.interface<File>("File", { name: "file" }),
            in_public: LogicType.boolean({ name: "public", optional: true })
        },
        outputs: {
            out_exec: LogicType.exec(),
            out_file: fileRecordSchema
        },
        methods: {
            async in_exec() {
                this.out_file = toFileOutput(await saveFile(this.in_file, { public: this.in_public }));
                return this.out_exec();
            }
        },
        display: { ...display, name: "Save File", config: { ...display.config, icon: faFileArrowUp } },
        documentation: {
            short: "Store an uploaded file",
            description: "Stores the file in the configured storage and records it in the `Files` table, owned by the connected user. Fails if the file breaks the user's role limits (size, number of files, total size). A public file can be opened by anyone with its URL; a private one needs a signed URL from `Get File URL`."
        },
        build: {
            generate: () => `async function () {
                this.out_file = await saveFile(this.in_file, { public: this.in_public });
                return this.out_exec();
            }`,
            imports: [{ name: "saveFile", target: serverTarget }]
        }
    }),
    makeLogicNode({
        name: "files/read",
        inputs: {
            in_exec: LogicType.exec(),
            in_id: LogicType.string({ name: "id" })
        },
        outputs: {
            out_exec: LogicType.exec(),
            out_file: LogicType.interface<File>("File", { name: "file" })
        },
        methods: {
            async in_exec() {
                this.out_file = await readFile(this.in_id);
                return this.out_exec();
            }
        },
        display: { ...display, name: "Read File", config: { ...display.config, icon: faFileArrowDown } },
        documentation: {
            short: "Get the content of a stored file",
            description: "Reads a stored file by its id and outputs it as a `File`, with its name and type. Fails with a 404 error if the file doesn't exist."
        },
        build: {
            generate: () => `async function () {
                this.out_file = await readFile(this.in_id);
                return this.out_exec();
            }`,
            imports: [{ name: "readFile", target: serverTarget }]
        }
    }),
    makeLogicNode({
        name: "files/delete",
        inputs: {
            in_exec: LogicType.exec(),
            in_id: LogicType.string({ name: "id" })
        },
        outputs: {
            out_exec: LogicType.exec()
        },
        methods: {
            async in_exec() {
                await deleteFile(this.in_id);
                return this.out_exec();
            }
        },
        display: { ...display, name: "Delete File", config: { ...display.config, icon: faTrash } },
        documentation: {
            short: "Delete a stored file",
            description: "Removes the file from the `Files` table and from the storage. Inside a `DB Transaction`, the content is only removed once the transaction succeeds. This node doesn't check who owns the file: check the `owner` yourself or protect the route with a guard."
        },
        build: {
            generate: () => `async function () {
                await deleteFile(this.in_id);
                return this.out_exec();
            }`,
            imports: [{ name: "deleteFile", target: serverTarget }]
        }
    }),
    makeLogicNode({
        name: "files/url",
        inputs: {
            in_exec: LogicType.exec(),
            in_id: LogicType.string({ name: "id" }),
            in_expires: LogicType.number({ name: "expires (s)", default: 3600, optional: true })
        },
        outputs: {
            out_exec: LogicType.exec(),
            out_url: LogicType.string({ name: "url" })
        },
        methods: {
            async in_exec() {
                this.out_url = await getFileUrl(this.in_id, this.in_expires ?? 3600);
                return this.out_exec();
            }
        },
        display: { ...display, name: "Get File URL", config: { ...display.config, icon: faLink } },
        documentation: {
            short: "Get a link to open or download a file",
            description: "Outputs a URL to the file, to use in an image, a link or a download. Public files get a permanent URL. Private files get a signed URL that stops working after `expires` seconds (1 hour by default). In the editor preview, the URL is a temporary local link."
        },
        build: {
            generate: () => `async function () {
                this.out_url = await getFileUrl(this.in_id, this.in_expires ?? 3600);
                return this.out_exec();
            }`,
            imports: [{ name: "getFileUrl", target: serverTarget }]
        }
    }),
    makeLogicNode({
        name: "files/usage",
        inputs: {
            in_exec: LogicType.exec()
        },
        outputs: {
            out_exec: LogicType.exec(),
            out_usage: LogicType.object({
                count: LogicType.number({ name: "count" }),
                size: LogicType.number({ name: "size" }),
                quota: LogicType.object({
                    maxFiles: LogicType.number({ name: "maxFiles", optional: true }),
                    maxFileSize: LogicType.number({ name: "maxFileSize", optional: true }),
                    maxTotalSize: LogicType.number({ name: "maxTotalSize", optional: true })
                }, { name: "quota" })
            }, { name: "usage" })
        },
        methods: {
            async in_exec() {
                const usage = await getCurrentUsage();
                this.out_usage = { ...usage, quota: toQuotaOutput(usage.quota) };
                return this.out_exec();
            }
        },
        display: { ...display, name: "File Usage", config: { ...display.config, icon: faChartPie } },
        documentation: {
            short: "Get the connected user's file usage and limits",
            description: "Outputs how many files the connected user stores, their total size in bytes, and the limits of their roles (`maxFileSize` and `maxTotalSize` in MB). An empty limit means unlimited."
        },
        build: {
            generate: () => `async function () {
                this.out_usage = await getCurrentUsage();
                return this.out_exec();
            }`,
            imports: [{ name: "getCurrentUsage", target: serverTarget }]
        }
    })
];
