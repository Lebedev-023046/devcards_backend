import { NotFoundException } from '@nestjs/common';
import { CardType } from '@prisma/client';
import { DeckAccessService } from './deck-access.service';

describe('DeckAccessService', () => {
  const prisma = {
    deck: {
      findUnique: jest.fn(),
    },
    card: {
      findUnique: jest.fn(),
    },
  };

  let service: DeckAccessService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DeckAccessService(prisma as never);
  });

  it('allows practice access to public cards', async () => {
    prisma.card.findUnique.mockResolvedValue({
      id: 'card-id',
      deckId: 'deck-id',
      question: 'Question',
      type: CardType.SINGLE_CHOICE,
      answer: null,
      options: [],
      deck: {
        id: 'deck-id',
        ownerId: 'owner-id',
        isPublic: true,
      },
    });

    await expect(
      service.getPracticeCard('card-id', 'other-user-id'),
    ).resolves.toMatchObject({
      id: 'card-id',
      deckId: 'deck-id',
      type: CardType.SINGLE_CHOICE,
    });
  });

  it('hides private cards from non-owners', async () => {
    prisma.card.findUnique.mockResolvedValue({
      id: 'card-id',
      deckId: 'deck-id',
      question: 'Question',
      type: CardType.SINGLE_CHOICE,
      answer: null,
      options: [],
      deck: {
        id: 'deck-id',
        ownerId: 'owner-id',
        isPublic: false,
      },
    });

    await expect(
      service.getPracticeCard('card-id', 'other-user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
