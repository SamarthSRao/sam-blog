const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

async function list() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
        });
        const data = await s3.send(command);
        console.log(data.Contents ? data.Contents.map(c => c.Key) : "Bucket is empty");
    } catch (e) {
        console.error("Error:", e);
    }
}
list();
