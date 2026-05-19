import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "../../../../lib/session";

const prisma = new PrismaClient();

export default async function EditPostPage({ params }) {
  await requireAdmin();

  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: {
      slug,
    },
  });

  if (!post) {
    notFound();
  }

  async function updatePost(formData) {
    "use server";

    await requireAdmin();

    const id = formData.get("id")?.toString();
    const title = formData.get("title")?.toString().trim();
    const nextSlug = formData.get("slug")?.toString().trim();
    const content = formData.get("content")?.toString().trim();
    const published = formData.get("published") === "on";

    if (!id || !title || !nextSlug || !content) {
      return;
    }

    const updatedPost = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        slug: nextSlug,
        content,
        published,
        updatedAt: new Date(),
      },
    });

    redirect(`/blog/${updatedPost.slug}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        <p className="text-[var(--muted-foreground)]">
          Update the title, slug, content, and publication status for this post.
        </p>
      </div>

      <form action={updatePost} className="space-y-6 blog-card">
        <input type="hidden" name="id" value={post.id} />

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            defaultValue={post.title}
            required
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            URL Slug
          </label>
          <input
            id="slug"
            type="text"
            name="slug"
            defaultValue={post.slug}
            required
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            defaultValue={post.content}
            required
            rows={14}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all resize-y"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post.published}
            className="h-4 w-4"
          />
          Published
        </label>

        <button
          type="submit"
          className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] font-bold py-3 rounded-md hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
