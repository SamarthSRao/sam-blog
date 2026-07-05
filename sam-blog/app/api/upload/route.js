import { NextResponse } from "next/server";
import { uploadImageToS3 } from "@/lib/s3";
import { getCurrentSession } from "@/lib/session";

export async function POST(request) {
  try {
    // 1. Security Check: Only allow admins to upload images
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Convert the File object to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Generate a unique filename to prevent overwrites
    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    // 5. Upload to S3
    const imageUrl = await uploadImageToS3(buffer, uniqueFileName, file.type);

    // 6. Return the URL so the Editor can insert it into the Markdown
    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
