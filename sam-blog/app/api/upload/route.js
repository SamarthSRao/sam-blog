import { NextResponse } from "next/server";
import { uploadIsolated } from "../../../lib/s3";
import { getCurrentSession } from "../../../lib/session";

export async function POST(request) 
{
    try{ 
        const session = await getCurrentSession();
        if(!session){
            return NextResponse.json({
                success:false,
                message:"unauthorised"
            })
        }
    
        const  formData = await request.formData();
        const file = formData.get("file");
        if(!file)
        {
            return NextResponse.json({
                success:false,
                message:"no file selected"
            })
        }

const fileName = file.name;
const fileType = file.type;

const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

// Sanitize filename to remove spaces and special characters (like '+') that break Markdown and S3 URLs
const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
const s3Key = `uploads/admin/${Date.now()}-${safeFileName}`;

await uploadIsolated(buffer, s3Key, file.type);

return NextResponse.json({
    success:true,
    message:"file uploaded successfully",
    url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`
})
}   

    catch(error) {
       console.error("Upload API Error:", error);
       return NextResponse.json({ success: false, message: error.message || "Upload failed"}, {status: 500});
}  }