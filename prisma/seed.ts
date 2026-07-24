import { PrismaPg } from '@prisma/adapter-pg';
import { CardType, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({ adapter });

const demoUsers = [
  {
    email: 'demo.user@deckspace.local',
    name: 'Demo User',
    age: 24,
    role: Role.USER,
  },
  {
    email: 'demo.admin@deckspace.local',
    name: 'Demo Admin',
    age: 31,
    role: Role.ADMIN,
  },
];

const tagDefinitions = [
  { name: 'Fast Learning', icon: 'Zap' },
  { name: 'English', icon: 'BookOpenText' },
  { name: 'History', icon: 'Landmark' },
  { name: 'Programming', icon: 'Code2' },
  { name: 'Quizzes', icon: 'CircleHelp' },
  { name: 'Geography', icon: 'Globe2' },
  { name: 'Science', icon: 'FlaskConical' },
  { name: 'Medicine', icon: 'Stethoscope' },
  { name: 'Art', icon: 'Palette' },
  { name: 'Mathematics', icon: 'Sigma' },
  { name: 'Facts', icon: 'Lightbulb' },
  { name: 'Music', icon: 'Music2' },
  { name: 'School', icon: 'GraduationCap' },
  { name: 'Exam', icon: 'ClipboardCheck' },
  { name: 'Games', icon: 'Gamepad2' },
  { name: 'Flashcards', icon: 'Layers3' },
  { name: 'Sports', icon: 'Trophy' },
  { name: 'Languages', icon: 'Languages' },
  { name: 'Psychology', icon: 'Brain' },
  { name: 'Logic', icon: 'Workflow' },
  { name: 'Miscellaneous', icon: 'Shapes' },
];
const tagNames = tagDefinitions.map(({ name }) => name);

type DemoCard = {
  question: string;
  type: CardType;
  answer?: string;
  options?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
};

type DemoDeck = {
  title: string;
  description: string;
  coverImageUrl: string;
  isPublic: boolean;
  ownerEmail: string;
  tags: string[];
  views: number;
  cards: DemoCard[];
};

const demoDecks: DemoDeck[] = [
  {
    title: 'JavaScript Interview Basics',
    description:
      'Core JavaScript questions for frontend interview warm-up practice.',
    coverImageUrl: '/deck-cover-generic-orbit.svg',
    isPublic: true,
    ownerEmail: 'demo.user@deckspace.local',
    tags: ['Programming', 'Exam', 'Flashcards'],
    views: 42,
    cards: [
      {
        question: 'What is closure in JavaScript?',
        type: CardType.INFO,
        answer:
          'A closure is a function bundled with references to its surrounding lexical scope.',
      },
      {
        question: 'Which operator checks both value and type?',
        type: CardType.SINGLE_CHOICE,
        options: [
          { text: '==', isCorrect: false },
          { text: '===', isCorrect: true },
          { text: '!=', isCorrect: false },
          { text: 'typeof', isCorrect: false },
        ],
      },
      {
        question: 'Which values are falsy in JavaScript?',
        type: CardType.MULTI_CHOICE,
        options: [
          { text: '0', isCorrect: true },
          { text: '""', isCorrect: true },
          { text: '[]', isCorrect: false },
          { text: 'null', isCorrect: true },
        ],
      },
    ],
  },
  {
    title: 'World Geography Starter',
    description: 'Short geography quiz for testing public deck discovery.',
    coverImageUrl: '/deck-cover-generic-horizon.svg',
    isPublic: true,
    ownerEmail: 'demo.admin@deckspace.local',
    tags: ['Geography', 'School', 'Quizzes'],
    views: 18,
    cards: [
      {
        question: 'What is the capital of Japan?',
        type: CardType.SINGLE_CHOICE,
        options: [
          { text: 'Kyoto', isCorrect: false },
          { text: 'Tokyo', isCorrect: true },
          { text: 'Osaka', isCorrect: false },
        ],
      },
      {
        question: 'Select countries located in South America.',
        type: CardType.MULTI_CHOICE,
        options: [
          { text: 'Brazil', isCorrect: true },
          { text: 'Argentina', isCorrect: true },
          { text: 'Portugal', isCorrect: false },
          { text: 'Chile', isCorrect: true },
        ],
      },
      {
        question: 'Largest ocean on Earth',
        type: CardType.INFO,
        answer: 'The Pacific Ocean is the largest ocean on Earth.',
      },
    ],
  },
  {
    title: 'Private Backend Notes',
    description:
      'Private owner-only deck for checking access rules from the frontend.',
    coverImageUrl: '/deck-cover-generic-contour.svg',
    isPublic: false,
    ownerEmail: 'demo.admin@deckspace.local',
    tags: ['Programming', 'Logic'],
    views: 3,
    cards: [
      {
        question: 'What does an API guard usually protect?',
        type: CardType.INFO,
        answer:
          'A guard protects route access before the request reaches business logic.',
      },
      {
        question: 'Which HTTP status means forbidden?',
        type: CardType.SINGLE_CHOICE,
        options: [
          { text: '401', isCorrect: false },
          { text: '403', isCorrect: true },
          { text: '404', isCorrect: false },
        ],
      },
    ],
  },
];

async function cleanupDemoData() {
  const demoEmails = demoUsers.map(({ email }) => email);

  const demoOwnedDecks = await prisma.deck.findMany({
    where: {
      owner: {
        email: { in: demoEmails },
      },
    },
    select: { id: true },
  });
  const demoDeckIds = demoOwnedDecks.map(({ id }) => id);

  if (demoDeckIds.length > 0) {
    await prisma.userCardStatus.deleteMany({
      where: {
        card: {
          deckId: { in: demoDeckIds },
        },
      },
    });
    await prisma.option.deleteMany({
      where: {
        card: {
          deckId: { in: demoDeckIds },
        },
      },
    });
    await prisma.card.deleteMany({
      where: {
        deckId: { in: demoDeckIds },
      },
    });
    await prisma.favoriteDeck.deleteMany({
      where: {
        deckId: { in: demoDeckIds },
      },
    });
    await prisma.deckTag.deleteMany({
      where: {
        deckId: { in: demoDeckIds },
      },
    });
    await prisma.deck.deleteMany({
      where: {
        id: { in: demoDeckIds },
      },
    });
  }

  await prisma.refreshToken.deleteMany({
    where: {
      user: {
        email: { in: demoEmails },
      },
    },
  });
  await prisma.userCardStatus.deleteMany({
    where: {
      user: {
        email: { in: demoEmails },
      },
    },
  });
  await prisma.favoriteDeck.deleteMany({
    where: {
      user: {
        email: { in: demoEmails },
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: { in: demoEmails },
    },
  });
}

async function seedTags() {
  await Promise.all(
    tagDefinitions.map(({ name, icon }) =>
      prisma.tag.upsert({
        where: { name },
        update: { icon },
        create: { name, icon },
      }),
    ),
  );

  const tags = await prisma.tag.findMany({
    where: {
      name: { in: tagNames },
    },
  });

  return new Map(tags.map((tag) => [tag.name, tag.id]));
}

async function seedUsers(passwordHash: string) {
  const users = await Promise.all(
    demoUsers.map((user) =>
      prisma.user.create({
        data: {
          ...user,
          password: passwordHash,
        },
      }),
    ),
  );

  return new Map(users.map((user) => [user.email, user.id]));
}

async function seedDecks(
  userIdsByEmail: Map<string, string>,
  tagIdsByName: Map<string, string>,
) {
  const cardsByQuestion = new Map<string, string>();
  const deckIdsByTitle = new Map<string, string>();

  for (const demoDeck of demoDecks) {
    const ownerId = userIdsByEmail.get(demoDeck.ownerEmail);

    if (!ownerId) {
      throw new Error(`Missing demo owner: ${demoDeck.ownerEmail}`);
    }

    const deck = await prisma.deck.create({
      data: {
        title: demoDeck.title,
        description: demoDeck.description,
        coverImageUrl: demoDeck.coverImageUrl,
        isPublic: demoDeck.isPublic,
        ownerId,
        views: demoDeck.views,
        totalCards: demoDeck.cards.length,
        deckTags: {
          create: demoDeck.tags.map((tagName) => {
            const tagId = tagIdsByName.get(tagName);

            if (!tagId) {
              throw new Error(`Missing tag: ${tagName}`);
            }

            return { tagId };
          }),
        },
      },
    });

    deckIdsByTitle.set(deck.title, deck.id);

    for (const demoCard of demoDeck.cards) {
      const card = await prisma.card.create({
        data: {
          question: demoCard.question,
          type: demoCard.type,
          answer: demoCard.answer,
          deckId: deck.id,
          options: demoCard.options
            ? {
                create: demoCard.options,
              }
            : undefined,
        },
      });

      cardsByQuestion.set(card.question, card.id);
    }
  }

  return { cardsByQuestion, deckIdsByTitle };
}

async function seedFrontendScenarios(
  userIdsByEmail: Map<string, string>,
  deckIdsByTitle: Map<string, string>,
  cardsByQuestion: Map<string, string>,
) {
  const demoUserId = userIdsByEmail.get('demo.user@deckspace.local');
  const geographyDeckId = deckIdsByTitle.get('World Geography Starter');
  const jsClosureCardId = cardsByQuestion.get('What is closure in JavaScript?');
  const jsEqualityCardId = cardsByQuestion.get(
    'Which operator checks both value and type?',
  );

  if (
    !demoUserId ||
    !geographyDeckId ||
    !jsClosureCardId ||
    !jsEqualityCardId
  ) {
    throw new Error('Demo scenario data is incomplete');
  }

  await prisma.favoriteDeck.create({
    data: {
      userId: demoUserId,
      deckId: geographyDeckId,
    },
  });

  await prisma.userCardStatus.createMany({
    data: [
      {
        userId: demoUserId,
        cardId: jsClosureCardId,
        attemptCount: 0,
        correctCount: 1,
      },
      {
        userId: demoUserId,
        cardId: jsEqualityCardId,
        attemptCount: 2,
        correctCount: 1,
      },
    ],
  });

  await prisma.deck.update({
    where: { id: deckIdsByTitle.get('JavaScript Interview Basics') },
    data: { totalReviews: 3 },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash('DemoPass123!', 10);

  await cleanupDemoData();
  const tagIdsByName = await seedTags();
  const userIdsByEmail = await seedUsers(passwordHash);
  const { cardsByQuestion, deckIdsByTitle } = await seedDecks(
    userIdsByEmail,
    tagIdsByName,
  );
  await seedFrontendScenarios(userIdsByEmail, deckIdsByTitle, cardsByQuestion);

  console.log('Seed completed');
  console.log('Demo user: demo.user@deckspace.local / DemoPass123!');
  console.log('Demo admin: demo.admin@deckspace.local / DemoPass123!');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
