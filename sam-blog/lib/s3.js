import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 1. Initialize the S3 Client
// This client securely communicates with AWS using the credentials from our .env file.
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * 2. Upload Helper Function
 * Takes a Buffer (file data), filename, and MIME type,
 * and uploads it to our S3 bucket.
 */
export async function uploadImageToS3(fileBuffer, fileName, mimeType) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  // Prepare the upload command
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName, // The path/name of the file in the bucket
    Body: fileBuffer,
    ContentType: mimeType,
  });

  // Execute the upload
  await s3Client.send(command);

  // Return the public URL of the uploaded image
  return `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
}
