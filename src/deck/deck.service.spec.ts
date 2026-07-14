import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeckService } from './deck.service';

describe('DeckService favorites', () => {
  const prisma = {
    deck: {
      findUnique: jest.fn(),
    },
    favoriteDeck: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const uploadService = {};

  let service: DeckService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DeckService(prisma as never, uploadService as never);
  });

  it('adds public decks to favorites', async () => {
    prisma.deck.findUnique.mockResolvedValue({
      id: 'deck-id',
      ownerId: 'owner-id',
      isPublic: true,
    });
    prisma.favoriteDeck.upsert.mockResolvedValue({});

    await expect(service.addFavorite('deck-id', 'user-id')).resolves.toEqual({
      deckId: 'deck-id',
      isFavorite: true,
    });
    expect(prisma.favoriteDeck.upsert).toHaveBeenCalled();
  });

  it('rejects own decks as favorites', async () => {
    prisma.deck.findUnique.mockResolvedValue({
      id: 'deck-id',
      ownerId: 'user-id',
      isPublic: true,
    });

    await expect(
      service.addFavorite('deck-id', 'user-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('hides private decks from favorite add', async () => {
    prisma.deck.findUnique.mockResolvedValue({
      id: 'deck-id',
      ownerId: 'owner-id',
      isPublic: false,
    });

    await expect(
      service.addFavorite('deck-id', 'user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
