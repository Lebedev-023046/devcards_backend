import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tags = [
    'Fast Learning',
    'English',
    'History',
    'Programming',
    'Quizzes',
    'Geography',
    'Science',
    'Medicine',
    'Art',
    'Mathematics',
    'Facts',
    'Music',
    'School',
    'Exam',
    'Games',
    'Flashcards',
    'Sports',
    'Languages',
    'Psychology',
    'Logic',
    'Miscellaneous',
  ];

  // Добавляем все теги, избегая дубликатов по имени
  await Promise.all(
    tags.map(async (name) => {
      await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }),
  );

  // 1. Создаем пользователя
  // const user = await prisma.user.create({
  //   data: {
  //     email: 'test@example.com',
  //     password: '12345678',
  //   },
  // });

  // 2. Создаем колоду
  // const deck = await prisma.deck.create({
  //   data: {
  //     title: 'JavaScript Basics',
  //     ownerId: user.id,
  //   },
  // });

  // 3. Создаем карточки с опциями
  // for (let i = 1; i <= 10; i++) {
  //   await prisma.card.create({
  //     data: {
  //       question: `Question ${i}`,
  //       deckId: deck.id,
  //       options: {
  //         create: [
  //           { text: `Option A for ${i}`, isCorrect: false },
  //           { text: `Option B for ${i}`, isCorrect: true },
  //           { text: `Option C for ${i}`, isCorrect: false },
  //         ],
  //       },
  //     },
  //   });
  // }

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
