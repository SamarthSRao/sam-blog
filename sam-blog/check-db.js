const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const post = await prisma.post.create({
      data: {
        title: "Test Post 2",
        slug: "test-post-" + Date.now(),
        content: "This is a test post.",
        coverImage: "http://example.com/image.jpg",
        published: true,
      }
    });
    console.log("SUCCESS:", post);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
