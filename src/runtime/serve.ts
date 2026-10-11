import { getRuntime } from "@/runtime/config.ts";
import { verifyFileUrl } from "@/runtime/signature.ts";

const inlineTypes = /^(image\/(png|jpeg|gif|webp|avif)|video\/[\w.+-]+|audio\/[\w.+-]+|application\/pdf|text\/plain)$/;

type TRequest = {
    params: unknown;
    query: unknown;
};

type TReply = {
    code: (status: number) => TReply;
    header: (key: string, value: string | number) => TReply;
    send: (payload?: unknown) => unknown;
};

export async function serveFile(request: TRequest, reply: TReply, secret: string) {
    const { id } = request.params as { id: string; };
    const { expires, signature } = request.query as { expires?: string; signature?: string; };
    const { db, storage } = getRuntime();
    const record = /^[\w-]+$/.test(id) ? (await db.find({ id }))[0] : undefined;

    if (!record) {
        return reply.code(404).send({ message: "File not found." });
    }

    if (!record.public && !await verifyFileUrl(secret, record.id, Number(expires), signature ?? "")) {
        return reply.code(403).send({ message: "This link is invalid or has expired." });
    }

    const content = await storage().read(record.id);

    if (!content) {
        return reply.code(404).send({ message: "File content not found." });
    }

    const disposition = inlineTypes.test(record.type) ? "inline" : "attachment";

    return reply
        .header("Content-Type", record.type || "application/octet-stream")
        .header("Content-Length", content.size)
        .header("Content-Disposition", `${ disposition }; filename*=UTF-8''${ encodeURIComponent(record.name) }`)
        .header("Content-Security-Policy", "sandbox")
        .header("X-Content-Type-Options", "nosniff")
        .header("Cache-Control", record.public ? "public, max-age=3600" : `private, max-age=${ Math.max(0, Math.floor(Number(expires) - Date.now() / 1000)) }`)
        .send(Buffer.from(await content.arrayBuffer()));
}
