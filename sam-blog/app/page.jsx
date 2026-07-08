import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import Link from "next/link";

export default async function Home() {
  const posts = await prisma.post.findMany();
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-4"> About me</h2>
      <p className="text-gray-700 mb-8">
        Welcome to my blog! Writing stuff just cause I can bettter understand
        things myself. Hope it helps you :)
      </p>
      <h1 className="text-2xl font-semibold mb-4"> My Blog Posts</h1>
      {posts.map((post) => (
        <div className="flex flex-col gap-2" key={post.id}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </div>
      ))}
    </div>
  );
}
