import { notFound, redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../../../../lib/session";
import { uploadIsolated } from "../../../../lib/s3";
import MarkdownEditor from "../../MarkdownEditor";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function EditPostPage({ params }) {
  await requireAdmin();
  
  const { id } = await params;
  
  const post = await prisma.post.findUnique({
    where: { id }
  });
  
  if (!post) {
    notFound();
  }

  async function updatePost(formData) {
    "use server";
    await requireAdmin();

    const title = formData.get("title")?.toString();
    const slug = formData.get("slug")?.toString();
    const content = formData.get("content")?.toString();
    const coverImageFile = formData.get("coverImage");

    if (!title || !slug || !content) {
      return;
    }

    let coverImageUrl = post.coverImage; // Default to existing image
    
    // If user uploaded a NEW image, process it
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        coverImageUrl = await uploadIsolated(buffer, coverImageFile.name, coverImageFile.type);
      } catch (s3Error) {
        console.error("AWS S3 Upload Failed:", s3Error);
      }
    }

    try {
      await prisma.post.update({
        where: { id },
        data: {
          title: title,
          slug: slug,
          content: content,
          coverImage: coverImageUrl,
        },
      });
    } catch (error) {
      console.error("Database Error:", error);
      return;
    }
    
    redirect("/blog");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link href="/admin" className="text-sm text-zinc-500 hover:text-white mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-zinc-500">
            Updating: <span className="text-white">{post.title}</span>
          </p>
        </div>
      </div>

      <form action={updatePost} className="space-y-6" encType="multipart/form-data">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            defaultValue={post.title}
            required
            className="w-full bg-[#111] border border-zinc-800 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium text-zinc-300">
            URL Slug
          </label>
          <input
            id="slug"
            type="text"
            name="slug"
            defaultValue={post.slug}
            required
            className="w-full bg-[#111] border border-zinc-800 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coverImage" className="text-sm font-medium text-zinc-300">
            Replace Featured Image (Optional)
          </label>
          <input
            id="coverImage"
            type="file"
            name="coverImage"
            accept="image/*"
            className="w-full bg-[#111] border border-zinc-800 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all"
          />
          {post.coverImage && (
            <p className="text-xs text-zinc-500 mt-1">Leave empty to keep existing image.</p>
          )}
        </div>

        <MarkdownEditor name="content" defaultValue={post.content} />

        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Update Post
        </button>
      </form>
    </div>
  );
}
