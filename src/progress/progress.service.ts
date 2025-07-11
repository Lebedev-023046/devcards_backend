import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewCardDto } from './dto/review-card.dto';
import { CardType } from '@prisma/client';
import { CardStatus, ProgressFilter } from './types/filter';

@Injectable()
export class ProgressService {
  private readonly LEARNED_THRESHOLD = +(process.env.LEARNED_THRESHOLD ?? 3);

  constructor(private readonly prisma: PrismaService) {}

  async reviewCard(
    userId: string,
    cardId: string,
    { viewed, answer, answers }: ReviewCardDto,
  ) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { options: true },
    });

    if (!card) {
      throw new NotFoundException(`Card with id "${cardId}" not found`);
    }

    let isCorrect = false;

    switch (card.type) {
      case CardType.INFO:
        // consider viewed card as correct
        if (viewed) {
          isCorrect = true;
        }
        break;

      case CardType.SINGLE_CHOICE:
        // detect correct option by id
        const correctOption = card.options.find((o) => o.isCorrect);
        isCorrect = correctOption?.id === answer;
        break;

      case CardType.MULTI_CHOICE:
        // detect correct options by id
        const correctIds = card.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);
        isCorrect =
          Array.isArray(answers) &&
          answers.length === correctIds.length &&
          answers.every((id) => correctIds.includes(id));
        break;
    }

    // update user card status based on viewed and correct
    return this.prisma.userCardStatus.upsert({
      where: { userId_cardId: { userId, cardId } },
      create: {
        userId,
        cardId,
        attemptCount: viewed ? 0 : 1,
        correctCount: isCorrect ? 1 : 0,
      },
      update: {
        ...(viewed ? {} : { attemptCount: { increment: 1 } }),
        ...(isCorrect ? { correctCount: { increment: 1 } } : {}),
      },
    });
  }

  async getDeckProgress(
    userId: string,
    deckId: string,
    filter: ProgressFilter = 'all',
  ) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException(`Deck ${deckId} not found`);

    // gather cards
    const cards = await this.prisma.card.findMany({
      where: { deckId },
      include: {
        userCardStatus: {
          where: { userId },
          take: 1,
        },
      },
    });

    // gather card details
    const details: CardStatus[] = cards.map((card) => {
      const status = card.userCardStatus[0];
      return {
        cardId: card.id,
        question: card.question,
        type: card.type,
        attemptCount: status?.attemptCount ?? 0,
        correctCount: status?.correctCount ?? 0,
        lastReviewedAt: status?.lastReviewedAt ?? null,
      };
    });

    // gather progress
    const totalCards = details.length;
    const learned = details.filter(
      (d) => d.correctCount >= this.LEARNED_THRESHOLD,
    ).length;
    const inProgress = details.filter(
      (d) => d.attemptCount > 0 && d.correctCount < this.LEARNED_THRESHOLD,
    ).length;
    const notStarted =
      totalCards - details.filter((d) => d.attemptCount > 0).length;

    // filter details by filter
    let filteredDetails = details;
    switch (filter) {
      case 'learned':
        filteredDetails = details.filter(
          (d) => d.correctCount >= this.LEARNED_THRESHOLD,
        );
        break;
      case 'inProgress':
        filteredDetails = details.filter(
          (d) => d.attemptCount > 0 && d.correctCount < this.LEARNED_THRESHOLD,
        );
        break;
      case 'notStarted':
        filteredDetails = details.filter((d) => d.attemptCount === 0);
        break;
      default:
        filteredDetails = details;
        break;
    }

    return {
      aggregate: { totalCards, learned, inProgress, notStarted },
      details: filteredDetails,
    };
  }

  async resetDeckProgress(userId: string, deckId: string) {
    return this.prisma.userCardStatus.deleteMany({
      where: {
        userId,
        card: { deckId },
      },
    });
  }
}
