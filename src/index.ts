import { faGauge, faHardDrive } from "@fortawesome/free-solid-svg-icons";
import { makePlugin } from "@luna-park/plugin";

import { backImports, getEnv, getInjections } from "@/build.ts";
import LLimitSettings from "@/components/LLimitSettings.vue";
import LStorageSettings from "@/components/LStorageSettings.vue";
import { config } from "@/config.ts";
import { configureEditorRuntime } from "@/editor/runtime.ts";
import { env, pluginId } from "@/env.ts";
import { initFilesDatabase } from "@/files/database.ts";
import { internals } from "@/internals.ts";
import llm from "@/llm.md?raw";
import icon from "@/logo.svg";
import { migrateSecrets } from "@/migrations/secrets.ts";
import { nodes } from "@/nodes/index.ts";
import { deleteUserFiles } from "@/runtime/files.ts";
import type { TUsersApi } from "@/users.ts";
import { usersApi, usersPluginId } from "@/users.ts";

let stopUserDelete: (() => void) | undefined;

export default makePlugin({
    id: pluginId,
    name: "Files",
    description: "Store files uploaded by your users.",
    icon,
    llm,
    config,
    internals,
    lifecycle: {
        mount: async (pluginEnv) => {
            Object.assign(env, pluginEnv);
            await migrateSecrets(pluginEnv);

            const users = await pluginEnv.getPlugin<TUsersApi>(usersPluginId);

            if (!users) {
                throw new Error("The Files plugin needs the Users plugin. Install it from the plugin library.");
            }

            usersApi.value = users;
            initFilesDatabase(users.usersTable());
            configureEditorRuntime(users);

            stopUserDelete?.();
            stopUserDelete = users.onUserDelete(deleteUserFiles);
        },
        unmount: () => {
            stopUserDelete?.();
            stopUserDelete = undefined;
        }
    },
    editor: {
        nodes
    },
    build: {
        backImports,
        env: getEnv,
        injections: getInjections
    },
    dependencies: [
        { id: usersPluginId, name: "Users", target: "@luna-park/plugin-users" }
    ],
    workspace: {
        openOnClick: true,
        sections: [
            {
                id: "storage",
                component: LStorageSettings,
                description: "Where files are stored in the editor and in your deployed app.",
                icon: faHardDrive,
                title: "Storage"
            },
            {
                id: "limits",
                component: LLimitSettings,
                description: "Per-role limits checked when a file is saved. A user with several roles gets the most generous limit of each kind. Leave a field empty for no limit. Uploads are also capped by the server's UPLOAD_MAX_SIZE (10 MB by default).",
                icon: faGauge,
                title: "Limits"
            }
        ]
    }
});
