import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CardType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeckAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanManageDeck(deckId: string, userId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, ownerId: true },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    if (deck.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this deck');
    }

    return deck;
  }

  async assertCanPracticeDeck(deckId: string, userId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, ownerId: true, isPublic: true },
    });

    if (!deck || (!deck.isPublic && deck.ownerId !== userId)) {
      throw new NotFoundException(`Deck ${deckId} not found`);
    }

    return deck;
  }

  async getPracticeCard(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        options: true,
        deck: {
          select: {
            id: true,
            ownerId: true,
            isPublic: true,
          },
        },
      },
    });

    if (!card || (!card.deck.isPublic && card.deck.ownerId !== userId)) {
      throw new NotFoundException(`Card with id "${cardId}" not found`);
    }

    return {
      id: card.id,
      deckId: card.deckId,
      question: card.question,
      type: card.type as CardType,
      answer: card.answer,
      options: card.options,
    };
  }
}
