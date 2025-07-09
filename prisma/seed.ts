import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (let i = 1; i <= 10; i++) {
    await prisma.card.create({
      data: {
        title: `Card #${i}`,
        options: {
          create: [
            {
              text: `Option A for card ${i}`,
              isCorrect: true,
            },
            {
              text: `Option B for card ${i}`,
              isCorrect: false,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Seed complete: 10 cards with options added');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
