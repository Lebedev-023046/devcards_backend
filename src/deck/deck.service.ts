import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface FindPublicParams {
  page?: number;
  limit?: number;
  query?: string;
  tagId?: string;
}

@Injectable()
export class DeckService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateDeckDto, userId: string) {
    return this.prisma.deck.create({
      data: {
        ...dto,
        ownerId: userId,
      },
    });
  }

  async findAllPublic({
    page = 1,
    limit = 10,
    query,
    tagId,
  }: FindPublicParams) {
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true };

    if (query) {
      const cleaned = query.trim().replace(/['"]/g, '');
      const terms = cleaned.split(/\s+/).filter(Boolean);

      where.AND = terms.map((term) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      }));
    }

    if (tagId) {
      where.AND = [...(where.AND ?? []), { deckTags: { some: { tagId } } }];
    }

    const [items, total] = await Promise.all([
      this.prisma.deck.findMany({ where, skip, take: limit }),
      this.prisma.deck.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }
  async findUserDecks(userId: string) {
    return this.prisma.deck.findMany({
      where: { ownerId: userId },
      include: { cards: true },
    });
  }

  async findOne(id: string) {
    const deck = await this.prisma.deck.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        cards: true,
      },
    });

    if (!deck) {
      throw new NotFoundException(`Deck ${id} not found`);
    }
    return deck;
  }

  async findTopByViews(limit = 5) {
    return this.prisma.deck.findMany({
      where: { isPublic: true },
      orderBy: { views: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        views: true,
        totalReviews: true,
      },
    });
  }

  async update(id: string, dto: UpdateDeckDto) {
    return this.prisma.deck.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.deck.delete({
      where: { id },
    });
  }
}
