import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/card/create-card.dto';
import { CardSortBy, QueryCardsDto } from './dto/card/query-cards.dto';
import { UpdateCardDto } from './dto/card/update-card.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCardsDto, userId: string) {
    const { deckId, page = 1, limit = 20, type } = query;
    const search = query.search ?? query.query;
    const skip = (page - 1) * limit;
    const where = this.buildWhere({ deckId, query: search, type, userId });

    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        include: { options: true },
        skip,
        take: limit,
        orderBy: {
          [query.sortBy ?? CardSortBy.UPDATED_AT]: query.sortOrder ?? 'desc',
        },
      }),
      this.prisma.card.count({ where }),
    ]);

    return {
      items: cards,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async validateQuestion(
    deckId: string,
    question: string,
    userId: string,
    excludeId?: string,
  ) {
    await this.ensureDeckOwner(deckId, userId);

    if (!question?.trim()) {
      throw new BadRequestException('Question is required');
    }

    const existing = await this.prisma.card.findFirst({
      where: {
        deckId,
        question: question.trim(),
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    return {
      available: !existing,
      deckId,
      question: question.trim(),
      excludeId: excludeId ?? null,
    };
  }

  async findOne(id: string, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id },
      include: { options: true },
    });

    if (!card) throw new NotFoundException('Card not found');
    await this.ensureDeckOwner(card.deckId, userId);
    return card;
  }

  async create(dto: CreateCardDto, userId: string) {
    await this.ensureDeckOwner(dto.deckId, userId);
    await this.ensureQuestionAvailable(dto.deckId, dto.question);
    this.validateCardPayload(dto, {
      requireChoiceOptions: true,
      requireInfoAnswer: true,
    });

    const data: Prisma.CardUncheckedCreateInput = {
      question: dto.question,
      type: dto.type,
      deckId: dto.deckId,
    };

    if (['SINGLE_CHOICE', 'MULTI_CHOICE'].includes(dto.type)) {
      data.options = {
        create: dto.options?.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      };
    }

    if (dto.type === 'INFO') {
      data.answer = dto.answer;
    }

    return this.prisma.$transaction(async (prisma) => {
      const card = await prisma.card.create({
        data,
        include: { options: true },
      });

      await prisma.deck.update({
        where: { id: dto.deckId },
        data: { totalCards: { increment: 1 } },
      });

      return card;
    });
  }

  async createMany(cards: CreateCardDto[], userId: string) {
    cards.forEach((dto) =>
      this.validateCardPayload(dto, {
        requireChoiceOptions: true,
        requireInfoAnswer: true,
      }),
    );

    if (cards.length === 0) return [];

    const deckId = cards[0].deckId;
    await this.ensureDeckOwner(deckId, userId);

    if (cards.some((card) => card.deckId !== deckId)) {
      throw new BadRequestException(
        'All cards in bulk create must use one deck',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const created = await Promise.all(
        cards.map((dto) => {
          const base = {
            question: dto.question,
            type: dto.type,
            deckId: dto.deckId,
          } as Prisma.CardUncheckedCreateInput;

          const data =
            dto.type === 'INFO'
              ? { ...base, answer: dto.answer }
              : {
                  ...base,
                  options: {
                    create:
                      dto.options?.map((o) => ({
                        text: o.text,
                        isCorrect: o.isCorrect,
                      })) ?? [],
                  },
                };

          return tx.card.create({ data, include: { options: true } });
        }),
      );

      await tx.deck.update({
        where: { id: deckId },
        data: { totalCards: { increment: cards.length } },
      });

      return created;
    });
  }

  async bulkDelete(ids: string[], userId: string) {
    const cards = await this.prisma.card.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        deckId: true,
        deck: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    const ownedCards = cards.filter((card) => card.deck.ownerId === userId);
    const grouped = ownedCards.reduce<Record<string, number>>((acc, card) => {
      acc[card.deckId] = (acc[card.deckId] ?? 0) + 1;
      return acc;
    }, {});

    await this.prisma.$transaction(async (tx) => {
      await tx.card.deleteMany({
        where: {
          id: { in: ownedCards.map((card) => card.id) },
        },
      });

      await Promise.all(
        Object.entries(grouped).map(([deckId, count]) =>
          tx.deck.update({
            where: { id: deckId },
            data: { totalCards: { decrement: count } },
          }),
        ),
      );
    });

    return {
      requested: ids.length,
      deleted: ownedCards.length,
      deletedIds: ownedCards.map((card) => card.id),
    };
  }

  async update(id: string, dto: UpdateCardDto, userId: string) {
    const existing = await this.prisma.card.findUnique({
      where: { id },
      select: { deckId: true, type: true },
    });

    if (!existing) {
      throw new NotFoundException('Card not found');
    }

    await this.ensureDeckOwner(existing.deckId, userId);

    if (dto.question) {
      await this.ensureQuestionAvailable(existing.deckId, dto.question, id);
    }

    const nextType = dto.type ?? existing.type;
    const isTypeChange = dto.type !== undefined && dto.type !== existing.type;

    if (
      dto.type !== undefined ||
      dto.options !== undefined ||
      dto.answer !== undefined
    ) {
      this.validateCardPayload(
        {
          type: nextType,
          options: dto.options,
          answer: dto.answer,
        },
        {
          requireChoiceOptions: isTypeChange || dto.options !== undefined,
          requireInfoAnswer: isTypeChange || dto.answer !== undefined,
        },
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.options !== undefined || nextType === CardType.INFO) {
        await tx.option.deleteMany({
          where: { cardId: id },
        });
      }

      return tx.card.update({
        where: { id },
        data: {
          question: dto.question,
          type: dto.type,
          answer:
            nextType === CardType.INFO
              ? dto.answer
              : isTypeChange
                ? null
                : undefined,
          options: dto.options
            ? {
                create: dto.options.map((opt) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                })),
              }
            : undefined,
        },
        include: { options: true },
      });
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const card = await prisma.card.findUnique({
        where: { id },
        select: {
          deckId: true,
          deck: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!card) throw new NotFoundException('Card not found');
      if (card.deck.ownerId !== userId) {
        throw new ForbiddenException('You do not have access to this card');
      }

      const deletedCard = await prisma.card.delete({
        where: { id },
      });

      await prisma.deck.update({
        where: { id: card.deckId },
        data: { totalCards: { decrement: 1 } },
      });

      return deletedCard;
    });
  }

  private buildWhere({
    deckId,
    query,
    type,
    userId,
  }: Pick<QueryCardsDto, 'deckId' | 'query' | 'search' | 'type'> & {
    userId: string;
  }): Prisma.CardWhereInput {
    const where: Prisma.CardWhereInput = {};

    where.deck = {
      ownerId: userId,
    };

    if (deckId) {
      where.deckId = deckId;
    }

    if (type) {
      where.type = type;
    }

    if (query?.trim()) {
      where.OR = [
        { question: { contains: query.trim(), mode: 'insensitive' } },
        { answer: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async ensureDeckOwner(deckId: string, userId: string) {
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

  private async ensureQuestionAvailable(
    deckId: string,
    question: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.card.findFirst({
      where: {
        deckId,
        question: question.trim(),
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        'Card with this question already exists in the deck',
      );
    }
  }

  private validateCardPayload(
    dto: {
      type: CardType;
      options?: { isCorrect: boolean }[];
      answer?: string;
    },
    {
      requireChoiceOptions,
      requireInfoAnswer,
    }: {
      requireChoiceOptions: boolean;
      requireInfoAnswer: boolean;
    },
  ) {
    if (dto.type === CardType.INFO) {
      if (dto.options?.length) {
        throw new BadRequestException('INFO card must not have options');
      }

      if (requireInfoAnswer && !dto.answer?.trim()) {
        throw new BadRequestException('INFO card must have non-empty answer');
      }

      return;
    }

    if (dto.answer?.trim()) {
      throw new BadRequestException('Choice card must not have answer');
    }

    if (requireChoiceOptions && (!dto.options || dto.options.length < 1)) {
      throw new BadRequestException('At least one option is required');
    }

    if (!dto.options) {
      return;
    }

    const correct = dto.options.filter((opt) => opt.isCorrect);

    if (dto.type === CardType.SINGLE_CHOICE && correct.length !== 1) {
      throw new BadRequestException(
        'SINGLE_CHOICE must have exactly one correct option',
      );
    }

    if (dto.type === CardType.MULTI_CHOICE && correct.length < 1) {
      throw new BadRequestException(
        'MULTI_CHOICE must have at least one correct option',
      );
    }
  }
}
