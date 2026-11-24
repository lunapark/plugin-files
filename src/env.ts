import type { TEnv, TFileDatabase } from "@luna-park/plugin";

import type { TConfig } from "@/config.ts";
import type { TInternals } from "@/internals.ts";

export const env = {} as TEnv<TConfig, TInternals>;

export const database: { files?: TFileDatabase; } = {};

export const pluginId = "files";
