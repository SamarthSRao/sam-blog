import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function main() {
  console.log("Seeding...");

  const myFirstPost = await prisma.post.create({
    data: {
      title: "My First Database Post",
      content:
        "This text travelled from my hard drive to the Postgres server and back!",
      published: true, // Let's make it published so we can see it!
    },
  });

  console.log("Success Created Post with ID:", myFirstPost.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
