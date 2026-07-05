import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const prisma = new PrismaClient();
const playfair = Playfair_Display({ subsets: ["latin"] });

export default async function BlogIndex() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] ${playfair.className}`}>
      
      {/* Navbar placeholder */}
      <nav className="flex items-center justify-between px-6 py-4 font-sans border-b border-[var(--border-primary)]">
        <Link href="/" className="text-sm font-medium hover:text-[var(--text-contrast)] transition-colors">
          ← SITE
        </Link>
        <div className="font-bold text-xl tracking-tight text-[var(--text-contrast)]">
          sam's blog
        </div>
        <div className="flex gap-4">
          <span className="text-sm text-[var(--text-secondary)]">🔍 ⌘K</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-24">
          <div className="text-xs tracking-[0.3em] font-sans font-bold text-[var(--text-secondary)] uppercase">
            WRITING
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-contrast)]">
            sam's blog
          </h1>
          <p className="text-xl italic text-[var(--text-secondary)]">
            engineering lessons for you and me, in plain words.
          </p>
          <div className="flex gap-2 pt-4">
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
          </div>
        </div>

        {/* Latest Posts */}
        <div>
          <div className="text-xs tracking-[0.2em] font-sans font-bold text-[var(--text-secondary)] uppercase mb-8 border-b border-[var(--border-primary)] pb-4">
            LATEST
          </div>
          
          <div className="space-y-16">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="block space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-contrast)] group-hover:opacity-80 transition-opacity leading-tight">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm font-sans text-[var(--text-secondary)] uppercase tracking-wider">
                    <time dateTime={post.createdAt.toISOString()}>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </time>
                  </div>
                </Link>
              </article>
            ))}
            
            {posts.length === 0 && (
              <p className="font-sans text-[var(--text-secondary)]">No posts published yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
