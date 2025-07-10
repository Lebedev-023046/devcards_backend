import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/card/create-card.dto';
import { UpdateCardDto } from './dto/card/update-card.dto';
import { CardType } from '@prisma/client';
import { PaginationDto } from './dto/card/pagination.dto';

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

    return this.prisma.card.create({
      data: {
        question: dto.question,
        type: dto.type,
        deckId: dto.deckId,
        options: {
          create: dto.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: { options: true },
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
    return this.prisma.card.delete({
      where: { id },
    });
  }

  private validateOptions(dto: {
    type?: CardType;
    options: { isCorrect: boolean }[];
  }) {
    if (!dto.options || dto.options.length < 1) {
      throw new BadRequestException('At least one option is required');
    }

    if (!dto.type) {
      throw new BadRequestException(
        'Card type is required when updating options',
      );
    }

    if (dto.type === 'INFO' && dto.options.length !== 1) {
      throw new BadRequestException(
        'INFO card must have exactly one explanation option',
      );
    }

    if (dto.type === 'SINGLE_CHOICE') {
      const correct = dto.options.filter((opt) => opt.isCorrect);
      if (correct.length !== 1) {
        throw new BadRequestException(
          'SINGLE_CHOICE must have exactly one correct option',
        );
      }
    }

    if (dto.type === 'MULTI_CHOICE') {
      const correct = dto.options.filter((opt) => opt.isCorrect);
      if (correct.length < 1) {
        throw new BadRequestException(
          'MULTI_CHOICE must have at least one correct option',
        );
      }
    }
  }
}
