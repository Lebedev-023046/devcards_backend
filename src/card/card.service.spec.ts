import { BadRequestException } from '@nestjs/common';
import { CardType } from '@prisma/client';
import { CardService } from './card.service';

type CardUpdateMock = jest.Mock<Promise<{ id: string }>, [unknown]>;
type TransactionClientMock = {
  option: {
    deleteMany: jest.Mock<unknown, [unknown]>;
  };
  card: {
    update: CardUpdateMock;
  };
};
type TransactionCallback = (
  tx: TransactionClientMock,
) => Promise<{ id: string }>;
type CardUpdateArgs = {
  data: {
    question?: string;
    answer?: string;
  };
};

describe('CardService', () => {
  const prisma = {
    card: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const deckAccess = {
    assertCanManageDeck: jest.fn(),
  };

  let service: CardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CardService(prisma as never, deckAccess as never);
  });

  it('rejects INFO cards with options', async () => {
    deckAccess.assertCanManageDeck.mockResolvedValue({ id: 'deck-id' });
    prisma.card.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          deckId: 'deck-id',
          question: 'Info question',
          type: CardType.INFO,
          answer: 'Info answer',
          options: [{ text: 'Option', isCorrect: true }],
        },
        'user-id',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not clear answer when only question is updated', async () => {
    const cardUpdate: CardUpdateMock = jest
      .fn<Promise<{ id: string }>, [unknown]>()
      .mockResolvedValue({ id: 'card-id' });
    const tx: TransactionClientMock = {
      option: { deleteMany: jest.fn<unknown, [unknown]>() },
      card: {
        update: cardUpdate,
      },
    };

    deckAccess.assertCanManageDeck.mockResolvedValue({ id: 'deck-id' });
    prisma.card.findUnique.mockResolvedValue({
      deckId: 'deck-id',
      type: CardType.INFO,
    });
    prisma.card.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockImplementation((callback: TransactionCallback) =>
      callback(tx),
    );

    await service.update(
      'card-id',
      { question: 'Updated question' },
      'user-id',
    );

    const [updateArgs] = cardUpdate.mock.calls[0] as [CardUpdateArgs];

    expect(updateArgs.data.question).toBe('Updated question');
    expect(updateArgs.data.answer).toBeUndefined();
  });
});
