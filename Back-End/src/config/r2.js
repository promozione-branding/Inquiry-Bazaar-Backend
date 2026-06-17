import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

export const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUD_FLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUD_FLARE_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUD_FLARE_SECRET_ACCESS_KEY,
    },

    forcePathStyle: true,
});
