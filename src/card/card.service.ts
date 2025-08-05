import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/card/create-card.dto';
import { PaginationDto } from './dto/card/pagination.dto';
import { UpdateCardDto } from './dto/card/update-card.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async findAllInDeck(deckId: string, query: PaginationDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        where: { deckId },
        include: { options: true },
        skip,
        take: limit,
      }),
      this.prisma.card.count({ where: { deckId } }),
    ]);

    return {
      data: cards,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async create(dto: CreateCardDto) {
    this.validateOptions(dto);

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

  async update(id: string, dto: UpdateCardDto) {
    if (dto.options) {
      this.validateOptions({
        type: dto.type,
        options: dto.options,
      });

      await this.prisma.option.deleteMany({
        where: { cardId: id },
      });
    }

    return this.prisma.card.update({
      where: { id },
      data: {
        question: dto.question,
        type: dto.type,
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
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      const card = await prisma.card.findUnique({
        where: { id },
        select: { deckId: true },
      });

      if (!card) throw new NotFoundException('Card not found');

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

  private validateOptions(dto: {
    type?: CardType;
    options?: { isCorrect: boolean }[];
    answer?: string;
  }) {
    if (!dto.type) {
      throw new BadRequestException(
        'Card type is required when updating options',
      );
    }

    if (dto.type === 'INFO') {
      if (!dto.answer) {
        throw new BadRequestException('INFO card must have non-empty answer');
      }
    }

    if (dto.type === 'SINGLE_CHOICE') {
      if (!dto.options || dto.options.length < 1) {
        throw new BadRequestException('At least one option is required');
      }
      const correct = dto.options.filter((opt) => opt.isCorrect);
      if (correct.length !== 1) {
        throw new BadRequestException(
          'SINGLE_CHOICE must have exactly one correct option',
        );
      }
    }

    if (dto.type === 'MULTI_CHOICE') {
      if (!dto.options || dto.options.length < 1) {
        throw new BadRequestException('At least one option is required');
      }
      const correct = dto.options.filter((opt) => opt.isCorrect);
      if (correct.length < 1) {
        throw new BadRequestException(
          'MULTI_CHOICE must have at least one correct option',
        );
      }
    }
  }
}
