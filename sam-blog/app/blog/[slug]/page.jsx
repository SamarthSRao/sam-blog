import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import { redirect } from "next/navigation";
import { getCurrentSession, requireAdmin } from "../../../lib/session";
import { Source_Code_Pro } from "next/font/google";

const sourceCode = Source_Code_Pro({ subsets: ["latin"] });

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
    // We use the default sans-serif font for the main wrapper
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-4 md:p-8 font-sans">
      
      <article className="max-w-2xl mx-auto md:mt-8">
        
        {/* 1. THE HEADER (Title & Date) */}
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          <time className={`${sourceCode.className} block text-zinc-500`}>
            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </time>
        </header>

        {/* 2. OPTIONAL FEATURED IMAGE */}
        {post.coverImage && (
          <div className="mb-12">
             <img src={post.coverImage} alt="Featured" className="w-full rounded border border-zinc-800" />
          </div>
        )}

        {/* 3. THE MARKDOWN CONTENT */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <Markdown>{post.content}</Markdown>
        </div>

        {/* 4. THE ADMIN DELETE BUTTON */}
        {isAdmin && (
          <div className="mt-16 pt-8 border-t border-zinc-800">
            <form action={deletePost}>
              <input type="hidden" name="itemId" value={post.id} />
              <button type="submit" className="text-red-500 hover:text-red-400 font-mono text-sm">
                [Delete Post]
              </button>
            </form>
          </div>
        )}

      </article>
    </div>
  );
}