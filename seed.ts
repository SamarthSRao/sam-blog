import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...")
}

const myFirstPost = await prisma.post.create({
  data: {
    title: "",
    content: "",
    published: false,
  },
});

console.log("Success Created Post with ID:", myFirstPost.id)
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
