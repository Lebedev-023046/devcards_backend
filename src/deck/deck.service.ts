import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { BulkUpdateDeckVisibilityDto } from './dto/bulk-update-deck-visibility.dto';
import { CreateDeckDto } from './dto/create-deck.dto';
import { DeckSortBy, QueryDecksDto, SortOrder } from './dto/query-decks.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

type PrismaError = {
  code?: string;
  message?: string;
};

@Injectable()
export class DeckService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}
  async create(dto: CreateDeckDto, userId: string) {
    try {
      await this.ensureTitleAvailable(dto.title, userId);

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
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      console.error('Create Deck error:', error);
      if (prismaError.code === 'P2002') {
        throw new BadRequestException('Deck with this title already exists');
      }
      if (prismaError.code === 'P2025') {
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
    sortBy = DeckSortBy.UPDATED_AT,
    sortOrder = SortOrder.DESC,
  }: QueryDecksDto) {
    return this.findMany({
      page,
      limit,
      query,
      tagId,
      sortBy,
      sortOrder,
      isPublic: true,
    });
  }

  async findUserDecks(userId: string, query: QueryDecksDto = {}) {
    return this.findMany({
      ...query,
      ownerId: userId,
    });
  }

  async findOnePublic(id: string) {
    return this.findSingle({
      id,
      where: { isPublic: true },
    });
  }

  async findOne(id: string, userId: string) {
    return this.findSingle({
      id,
      where: {
        OR: [{ isPublic: true }, { ownerId: userId }],
      },
    });
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
        coverImageUrl: true,
        totalCards: true,
        views: true,
        totalReviews: true,
      },
    });
  }

  async validateTitle(title: string, userId: string, excludeId?: string) {
    if (!title?.trim()) {
      throw new BadRequestException('Title is required');
    }

    const existing = await this.prisma.deck.findFirst({
      where: {
        title: title.trim(),
        ownerId: userId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    return {
      available: !existing,
      title: title.trim(),
      excludeId: excludeId ?? null,
    };
  }

  async update(id: string, dto: UpdateDeckDto, userId: string) {
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    await this.ensureOwner(id, userId);

    if (dto.title) {
      await this.ensureTitleAvailable(dto.title, userId, id);
    }

    return this.prisma.deck.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic,
        coverImageUrl: dto.coverImageUrl,
        deckTags: dto.tagIds
          ? {
              deleteMany: {},
              create: dto.tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        deckTags: {
          include: { tag: true },
        },
      },
    });
  }

  async bulkUpdateVisibility(
    { ids, isPublic }: BulkUpdateDeckVisibilityDto,
    userId: string,
  ) {
    const result = await this.prisma.deck.updateMany({
      where: {
        id: { in: ids },
        ownerId: userId,
      },
      data: { isPublic },
    });

    return {
      updated: result.count,
      ids,
      isPublic,
    };
  }

  async bulkDelete(ids: string[], userId: string) {
    const decks = await this.prisma.deck.findMany({
      where: {
        id: { in: ids },
        ownerId: userId,
      },
      select: {
        id: true,
        coverImageUrl: true,
      },
    });

    await Promise.all(
      decks
        .filter((deck) => Boolean(deck.coverImageUrl))
        .map((deck) => this.uploadService.deleteFile(deck.coverImageUrl)),
    );

    const result = await this.prisma.deck.deleteMany({
      where: {
        id: { in: decks.map((deck) => deck.id) },
        ownerId: userId,
      },
    });

    return {
      requested: ids.length,
      deleted: result.count,
      deletedIds: decks.map((deck) => deck.id),
    };
  }

  async remove(id: string, userId: string) {
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    const deck = await this.ensureOwner(id, userId);
    if (deck.coverImageUrl) {
      await this.uploadService.deleteFile(deck.coverImageUrl);
    }

    try {
      return await this.prisma.deck.delete({
        where: { id },
      });
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      console.error('[DeckService] Delete error:', error);
      throw new InternalServerErrorException(
        prismaError.message ?? 'Failed to delete deck',
      );
    }
  }

  private async findMany({
    page = 1,
    limit = 10,
    query,
    tagId,
    sortBy = DeckSortBy.UPDATED_AT,
    sortOrder = SortOrder.DESC,
    isPublic,
    ownerId,
  }: QueryDecksDto & { ownerId?: string }) {
    const skip = (page - 1) * limit;

    const where: Prisma.DeckWhereInput = {};

    if (typeof isPublic === 'boolean') {
      where.isPublic = isPublic;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

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
      const existingAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
          ? [where.AND]
          : [];
      where.AND = [...existingAnd, { deckTags: { some: { tagId } } }];
    }

    const [items, total] = await Promise.all([
      this.prisma.deck.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          deckTags: { include: { tag: true } },
        },
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

  private async findSingle({
    id,
    where,
  }: {
    id: string;
    where?: Prisma.DeckWhereInput;
  }) {
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    const deck = await this.prisma.deck.findFirst({
      where: {
        id,
        ...where,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        cards: {
          include: {
            options: true,
          },
        },
        deckTags: {
          include: { tag: true },
        },
      },
    });

    if (!deck) {
      throw new NotFoundException(`Deck ${id} not found`);
    }

    await this.prisma.deck.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return {
      ...deck,
      views: deck.views + 1,
    };
  }

  private async ensureOwner(id: string, userId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    if (deck.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this deck');
    }

    return deck;
  }

  private async ensureTitleAvailable(
    title: string,
    userId: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.deck.findFirst({
      where: {
        title: title.trim(),
        ownerId: userId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        'Deck with this title already exists for current user',
      );
    }
  }
}
