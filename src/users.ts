import { shallowRef } from "vue";

export const usersPluginId = "users";

export type TUsersApi = {
    onUserDelete: (listener: (userId: string) => Promise<void> | void) => () => void;
    resolveUser: () => Promise<{ id: string; login: string; roles: Array<string>; }>;
    roles: () => Array<{ id: string; label: string; }>;
    usersTable: () => string | undefined;
};

export const usersApi = shallowRef<TUsersApi>();
