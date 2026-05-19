import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import { redirect } from "next/navigation";
import { getCurrentSession, requireAdmin } from "../../../lib/session";

export default async function ReturnPosts({ params }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: {
      slug: slug,
    },
  });

  if (!post) {
    return notFound();
  }

  const session = await getCurrentSession();
  const isAdmin = Boolean(session);

  // Server action for deleting posts
  async function deletePost(formData) {
    "use server";
    await requireAdmin();

    const idToDelete = formData.get("itemId")?.toString();

    if (!idToDelete) {
      return;
    }

    await prisma.post.delete({
      where: {
        id: idToDelete,
      },
    });

    redirect("/");
  }

  return (
    <article className="prose-invert animate-in fade-in duration-700">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:underline mb-8"
      >
        ← Back to all posts
      </Link>

      <header className="space-y-4 mb-10">
        <div className="text-sm font-medium text-[var(--muted-foreground)]">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          {post.title}
        </h1>
      </header>

      <section className="whitespace-pre-wrap leading-relaxed text-[var(--foreground)] opacity-90">
        <Markdown>{post.content}</Markdown>
      </section>

      <div className="mt-16 pt-8 border-t border-[var(--border)] space-y-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          Thanks for reading! If you enjoyed this post, feel free to share it.
        </p>

        {/* Admin controls - only render if user is admin */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:underline"
              >
                ← Back to admin
              </Link>
              <Link
                href={`/admin/edit/${slug}`}
                className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:underline"
              >
                ✎ Edit post
              </Link>
            </div>

            <form action={deletePost}>
              <input type="hidden" name="itemId" value={post.id} />
              <button
                type="submit"
                className="rounded-md border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Delete Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
