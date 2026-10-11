export type TStorage = {
    delete: (key: string) => Promise<void>;
    read: (key: string) => Promise<Blob | undefined>;
    write: (key: string, file: Blob) => Promise<void>;
};
