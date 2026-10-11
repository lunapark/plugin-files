import type { TEnv, TFileDatabase } from "@luna-park/plugin";

import type { TInternals } from "@/internals.ts";

export const env = {} as TEnv<never, TInternals>;

export const database: { files?: TFileDatabase; } = {};
