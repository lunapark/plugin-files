import { LogicType } from "@luna-park/plugin";

export const secretNames = {
    editorS3Secret: "EDITOR_S3_SECRET_ACCESS_KEY",
    s3Secret: "S3_SECRET_ACCESS_KEY"
};

export const config = LogicType.object({
    editorS3Secret: LogicType.string({ name: "Editor S3 secret access key", options: { hidden: true, secret: secretNames.editorS3Secret } }),
    s3Secret: LogicType.string({ name: "S3 secret access key", options: { hidden: true, secret: secretNames.s3Secret } })
});

export type TConfig = typeof config;
