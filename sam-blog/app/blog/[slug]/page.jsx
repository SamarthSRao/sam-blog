import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import { redirect } from "next/navigation";
import { getCurrentSession, requireAdmin } from "../../../lib/session";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

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

  // Calculate approximate reading time (200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200) || 1;

  return (
    <article className={`prose-invert animate-in fade-in duration-700 max-w-3xl mx-auto px-4 sm:px-6 py-12 ${playfair.className}`}>
      <Link
        href="/"
        className="inline-flex items-center text-sm font-sans font-medium text-[var(--text-secondary)] hover:text-[var(--text-contrast)] transition-colors mb-16"
      >
        ← Back to all posts
      </Link>

      <header className="flex flex-col items-center text-center space-y-6 mb-16">
        <div className="text-xs tracking-widest font-sans font-semibold text-[var(--text-secondary)] uppercase">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <span className="mx-2">·</span>
          {readingTime} MIN READ
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-contrast)] leading-tight max-w-4xl">
          {post.title}
        </h1>
      </header>

      {/* Audio Player Placeholder */}
      <div className="flex items-center justify-between border-y border-[var(--border-primary)] py-4 mb-16 font-sans">
        <button className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-contrast)] transition-colors">
          <div className="w-8 h-8 rounded-full border border-[var(--text-secondary)] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          LISTEN
        </button>
        <div className="text-xs text-[var(--text-secondary)] tabular-nums">
          0:00 / {readingTime}:00
        </div>
      </div>

      <section className="blog-content whitespace-pre-wrap leading-relaxed text-[var(--text-primary)] text-lg sm:text-xl opacity-90">
        <Markdown>{post.content}</Markdown>
      </section>

      <div className="mt-24 pt-8 border-t border-[var(--border-primary)] space-y-4 font-sans">
        <p className="text-sm text-[var(--text-secondary)] text-center">
          Thanks for reading! If you enjoyed this post, feel free to share it.
        </p>

        {/* Admin controls - only render if user is admin */}
        {isAdmin && (
          <div className="space-y-4 flex flex-col items-center mt-8">
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center text-sm font-medium text-[var(--text-blue)] hover:underline"
              >
                ← Back to admin
              </Link>
              <Link
                href={`/admin/edit/${slug}`}
                className="inline-flex items-center text-sm font-medium text-[var(--text-blue)] hover:underline"
              >
                ✎ Edit post
              </Link>
            </div>

            <form action={deletePost}>
              <input type="hidden" name="itemId" value={post.id} />
              <button
                type="submit"
                className="rounded-md border border-[var(--text-red)] px-4 py-2 text-sm text-[var(--text-red)] hover:bg-[var(--text-red)] hover:bg-opacity-10 transition-colors"
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
