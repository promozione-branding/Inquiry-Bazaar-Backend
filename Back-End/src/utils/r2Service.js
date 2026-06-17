import { PutObjectCommand, DeleteObjectCommand, } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { r2 } from "../config/r2.js";

export const uploadToR2 = async ({ file, folder, fileName, contentType, }) => {
    try {
        let uploadBuffer = file;
        let finalContentType = contentType;
        let finalFileName = fileName;

        if (contentType?.startsWith("image/")) {
            uploadBuffer = await sharp(file).webp({ quality: 80, }).toBuffer();
            finalContentType = "image/webp";
            finalFileName = fileName.replace(/\.[^/.]+$/, ".webp");
        }

        const key = `${folder}/${finalFileName}`;
        await r2.send(new PutObjectCommand({
            Bucket: process.env.CLOUD_FLARE_R2_BUCKET,
            Key: key,
            Body: uploadBuffer,
            ContentType: finalContentType,
        })
        );

        return {
            key,
            url: `${process.env.CLOUD_FLARE_R2_PUBLIC_URL}/${key}`,
        };

    } catch (error) {
        console.log("R2 Upload Error:", error);
        throw error;
    }
};

export const deleteFromR2 = async (key) => {
    try {
        if (!key) return false;

        await r2.send(new DeleteObjectCommand({
            Bucket: process.env.CLOUD_FLARE_R2_BUCKET,
            Key: key,
        }));

        return true;
    } catch (error) {
        console.log("R2 Delete Error:", error.message);
        return false;
    }
};