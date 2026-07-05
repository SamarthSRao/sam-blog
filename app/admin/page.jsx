import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function AdminPage() {
  async function createPost(formData) {
    "use server";
    const title = formData.get("title");
    const slug = formData.get("slug");
    const content = formData.get("content");
    try {
      await prisma.post.create({
        data: {
          title: title,
          slug: slug,
          content: content,
          published: true,
        },
      });
    } catch (error) {
      console.error(error);
      return;
    }
    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
        <p className="text-[var(--muted-foreground)]">
          Draft and publish your next thought to the world.
        </p>
      </div>

      <form action={createPost} className="space-y-6 blog-card">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Post Title"
            required
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">URL Slug</label>
          <input
            id="slug"
            type="text"
            name="slug"
            placeholder="my-awesome-post"
            required
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">Content</label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your story..."
            required
            rows={12}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] font-bold py-3 rounded-md hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
        >
          Publish Post
        </button>
      </form>
    </div>
  );
}

