import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { destroySession, requireAdmin } from "../../lib/session";
import { uploadIsolated } from "../../lib/s3";

const prisma = new PrismaClient();

export default async function AdminPage() {
  await requireAdmin();

  async function createPost(formData) {
    "use server";

    await requireAdmin();

    const title = formData.get("title")?.toString();
    const slug = formData.get("slug")?.toString();
    const content = formData.get("content")?.toString();
    const coverImageFile = formData.get("coverImage");

    if (!title || !slug || !content) {
      return;
    }

    let coverImageUrl = null;
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        coverImageUrl = await uploadIsolated(buffer, coverImageFile.name, coverImageFile.type);
      } catch (s3Error) {
        console.error("AWS S3 Upload Failed:", s3Error);
        // If the upload fails (e.g. bucket doesn't exist), we will still create the post but without the image.
      }
    }

    try {
      await prisma.post.create({
        data: {
          title: title,
          slug: slug,
          content: content,
          coverImage: coverImageUrl,
          published: true,
        },
      });
    } catch (error) {
      console.error("Database Error:", error);
      return;
    }
    
    // Redirect to the blog index instead of the homepage!
    redirect("/blog");
  }

  async function logout() {
    "use server";

    await destroySession();
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
          <p className="text-zinc-500">
            Draft and publish your next thought with a featured image.
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Added encType for file uploads */}
      <form action={createPost} className="space-y-6" encType="multipart/form-data">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Post Title"
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
            placeholder="my-awesome-post"
            required
            className="w-full bg-[#111] border border-zinc-800 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="coverImage" className="text-sm font-medium text-zinc-300">
            Featured Image (Optional)
          </label>
          <input
            id="coverImage"
            type="file"
            name="coverImage"
            accept="image/*"
            className="w-full bg-[#111] border border-zinc-800 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-zinc-300">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your markdown here..."
            required
            rows={12}
            className="w-full bg-[#111] border border-zinc-800 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all resize-none font-mono"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Publish Post
        </button>
      </form>
    </div>
  );
}
