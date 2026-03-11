import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create a default Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devcards.com' },
    update: {},
    create: {
      email: 'admin@devcards.com',
      password: 'password123',
      role: Role.ADMIN,
    },
  });

  // 2. Create a default Deck
  const deck = await prisma.deck.create({
    data: {
      title: 'General Programming',
      description: 'Test your knowledge on general programming concepts.',
      isPublic: true,
      ownerId: admin.id,
    },
  });

  // 3. Create Cards for the Deck
  for (let i = 1; i <= 5; i++) {
    await prisma.card.create({
      data: {
        question: `What is concept #${i}?`,
        deckId: deck.id,
        options: {
          create: [
            {
              text: `Correct Answer for concept ${i}`,
              isCorrect: true,
            },
            {
              text: `Incorrect Answer for concept ${i}`,
              isCorrect: false,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Seed complete: Admin user, 1 deck, and 5 cards added');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
