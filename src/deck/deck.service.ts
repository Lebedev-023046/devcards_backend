import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

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
    try {
      return await this.prisma.deck.create({
        data: {
          title: dto.title,
          description: dto.description || '',
          isPublic: dto.isPublic ?? true,
          coverImageUrl: dto.coverImageUrl || '',
          totalCards: 0,
          ownerId: userId,
          ...(dto.tagIds?.length
            ? {
                deckTags: {
                  create: dto.tagIds.map((tagId) => ({
                    tag: { connect: { id: tagId } },
                  })),
                },
              }
            : {}),
        },
        include: {
          deckTags: {
            include: { tag: true },
          },
        },
      });
    } catch (error) {
      console.error('Create Deck error:', error);
      if (error.code === 'P2002') {
        throw new BadRequestException('Deck with this title already exists');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('Some tag does not exist');
      }
      throw new InternalServerErrorException('Failed to create deck');
    }
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
      this.prisma.deck.findMany({
        where,
        skip,
        take: limit,
        include: { deckTags: { include: { tag: true } } },
      }),
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
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    const deck = await this.prisma.deck.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        cards: true,
        deckTags: {
          include: { tag: true },
        },
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
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    return this.prisma.deck.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic,

        deckTags: {
          create: dto.tagIds?.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    });
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    const deck = await this.prisma.deck.findUnique({ where: { id } });
    if (!deck) {
      throw new NotFoundException(`Deck not found`);
    }

    try {
      return await this.prisma.deck.delete({
        where: { id },
      });
    } catch (error) {
      console.error('[DeckService] Delete error:', error); // <-- сюда смотри!
      throw new InternalServerErrorException(
        error.message || 'Failed to delete deck',
      );
    }
  }
}
