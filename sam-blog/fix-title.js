const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany();
  for (const post of posts) {
    console.log(post.title);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
