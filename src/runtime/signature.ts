const encoder = new TextEncoder();

async function getKey(secret: string) {
    return await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function signFileUrl(secret: string, id: string, expires: number) {
    const signature = await crypto.subtle.sign("HMAC", await getKey(secret), encoder.encode(`${ id }:${ expires }`));
    return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyFileUrl(secret: string, id: string, expires: number, signature: string) {
    if (!Number.isFinite(expires) || expires < Date.now() / 1000) {
        return false;
    }

    const expected = await signFileUrl(secret, id, expires);
    let difference = expected.length ^ signature.length;

    for (let index = 0; index < expected.length; index++) {
        difference |= expected.charCodeAt(index) ^ (signature.charCodeAt(index) || 0);
    }

    return difference === 0;
}
