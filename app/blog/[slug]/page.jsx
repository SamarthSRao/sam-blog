import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ReturnPosts({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await prisma.post.findUnique({
    where: {
      slug: slug,
    },
  });

  if (!post) {
    return notFound();
  }

  return (
    <article className="prose animate-in fade-in duration-700">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm font-medium text-[var(--accent)] hover:underline mb-8"
      >
        ← Back to all posts
      </Link>
      
      <header className="space-y-4 mb-10">
        <div className="text-sm font-medium text-[var(--muted-foreground)]">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          {post.title}
        </h1>
      </header>

      <section className="whitespace-pre-wrap leading-relaxed text-[var(--foreground)] opacity-90">
        {post.content}
      </section>

      <div className="mt-16 pt-8 border-t border-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">
          Thanks for reading! If you enjoyed this post, feel free to share it.
        </p>
      </div>
    </article>
  );
}

