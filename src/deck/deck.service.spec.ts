import { NotFoundException } from '@nestjs/common';
import { DeckService } from './deck.service';

describe('DeckService favorites', () => {
  const prisma = {
    deck: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
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

  it('allows owners to favorite their private decks', async () => {
    prisma.deck.findUnique.mockResolvedValue({
      id: 'deck-id',
      ownerId: 'user-id',
      isPublic: false,
    });
    prisma.favoriteDeck.upsert.mockResolvedValue({});

    await expect(service.addFavorite('deck-id', 'user-id')).resolves.toEqual({
      deckId: 'deck-id',
      isFavorite: true,
    });
    expect(prisma.favoriteDeck.upsert).toHaveBeenCalled();
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

  it('does not reject an unchanged title while updating a deck', async () => {
    prisma.deck.findUnique.mockResolvedValue({
      id: 'deck-id',
      ownerId: 'user-id',
      title: 'Existing title',
    });
    prisma.deck.update.mockResolvedValue({
      id: 'deck-id',
      ownerId: 'user-id',
      title: 'Existing title',
      description: '',
      isPublic: false,
      coverImageUrl: '',
      deckTags: [],
      owner: { id: 'user-id', name: 'User' },
    });

    await expect(
      service.update(
        'deck-id',
        {
          title: 'Existing title',
          description: '',
          isPublic: false,
          coverImageUrl: '',
          tagIds: [],
        },
        'user-id',
      ),
    ).resolves.toMatchObject({ id: 'deck-id', title: 'Existing title' });

    expect(prisma.deck.findFirst).not.toHaveBeenCalled();
  });
});
