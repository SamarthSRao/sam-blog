import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Source_Code_Pro, Arvo } from "next/font/google";

const prisma = new PrismaClient();
const sourceCode = Source_Code_Pro({ subsets: ["latin"] });
const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"] });

export default async function BlogIndex() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.createdAt).getFullYear();
    if(!acc[year]){
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});

 return(
  <div className={`${arvo.className} min-h-screen bg-[#0a0a0a] text-white p-8`}>
    <article className="max-w-2xl mx-auto space-y-16">
      {Object.entries(postsByYear).sort(([a],[b]) => b[0] - a[0]).map(([year, yearPosts]) => (
        <section key={year}>
          <h2 className="text-xl font-bold mb-4">{year}</h2>

          <ol className="text-2xl font-bold mb-6 text-zinc-400 space-y-2">
            {yearPosts.map((post) => (

              <li key={post.id} className="hover:text-white transition-colors underline-offset-4 hover:underline">
                <time className={`${sourceCode.className} text-zinc-500 w-16 shrink-0 inline-block mr-4`}>
                  {new Date(post.createdAt).toLocaleDateString("en-us", { month: "2-digit", day:"2-digit"})}
                </time>
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </article>
  </div>
 );
}