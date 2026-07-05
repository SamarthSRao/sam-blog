import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


const _s3client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

export async function uploadIsolated(fileBuffer, fileName, mimeType) {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `user-uploads/${fileName}`,
            Body: fileBuffer,
            ContentType: mimeType,
            ACL: "public-read",
        });

        await _s3client.send(command);

        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/user-uploads/${fileName}`;
    } catch (error) {
        console.error("S3 Upload failed", error);
        throw error;
    }
}
