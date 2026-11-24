import type { TEnv } from "@luna-park/plugin";
import { getPluginSecretEnvName } from "@luna-park/plugin";

import type { TConfig } from "@/config.ts";
import { secretNames } from "@/config.ts";
import { pluginId } from "@/env.ts";
import type { TInternals } from "@/internals.ts";
import { EProductionStorage } from "@/internals.ts";

export async function migrateSecrets({ internals, secrets }: TEnv<TConfig, TInternals>) {
    for (const [name, settings] of [[secretNames.editorS3Secret, internals.editor.s3], [secretNames.s3Secret, internals.production.s3]] as const) {
        if (settings.secretAccessKey && secrets?.available) {
            await secrets.set(name, settings.secretAccessKey);
            delete settings.secretAccessKey;
        }
    }
}

export function getLegacySecretEnv({ internals }: TEnv<TConfig, TInternals>) {
    const { production } = internals;
    return production.storage === EProductionStorage.S3 && production.s3.secretAccessKey ? { [getPluginSecretEnvName(pluginId, secretNames.s3Secret)]: production.s3.secretAccessKey } : {};
}
