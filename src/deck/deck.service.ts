import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { omitUndefined } from 'src/common/utils/object.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { PatchDeckDto } from './dto/patch-deck.dto';
import {
  DeckScope,
  DeckSortBy,
  DeckVisibility,
  GetDecksQueryDto,
} from './dto/query-decks.dto';
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
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
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

  async findAll(query: GetDecksQueryDto = {}, userId?: string) {
    return this.findMany(query, userId);
  }

  async findOne(id: string, userId?: string) {
    return this.findSingle({
      id,
      requesterId: userId,
    });
  }

  async getFavoriteIds(userId: string) {
    const favoriteDecks = await this.prisma.favoriteDeck.findMany({
      where: { userId },
      select: { deckId: true },
      orderBy: { createdAt: 'desc' },
    });

    return favoriteDecks.map((favoriteDeck) => favoriteDeck.deckId);
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
    await this.ensureTitleAvailable(dto.title, userId, id);

    return this.prisma.deck.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic,
        coverImageUrl: dto.coverImageUrl,
        deckTags: {
          deleteMany: {},
          create: dto.tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        deckTags: {
          include: { tag: true },
        },
      },
    });
  }

  async patch(id: string, dto: PatchDeckDto, userId: string) {
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    const existingDeck = await this.prisma.deck.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        isPublic: true,
      },
    });

    if (!existingDeck) {
      throw new NotFoundException(`Deck ${id} not found`);
    }

    const hasDeckFieldUpdates =
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.isPublic !== undefined;

    if (hasDeckFieldUpdates && existingDeck.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this deck');
    }

    if (
      dto.isFavorite !== undefined &&
      !existingDeck.isPublic &&
      existingDeck.ownerId !== userId
    ) {
      throw new NotFoundException(`Deck ${id} not found`);
    }

    if (dto.title !== undefined) {
      await this.ensureTitleAvailable(dto.title, userId, id);
    }

    const data = omitUndefined<Prisma.DeckUpdateInput>({
      title: dto.title,
      description: dto.description === null ? '' : dto.description,
      isPublic: dto.isPublic,
    });

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.deck.update({
          where: { id },
          data,
        });
      }

      if (dto.isFavorite === true) {
        await tx.favoriteDeck.upsert({
          where: {
            userId_deckId: {
              userId,
              deckId: id,
            },
          },
          update: {},
          create: {
            userId,
            deckId: id,
          },
        });
      } else if (dto.isFavorite === false) {
        await tx.favoriteDeck.deleteMany({
          where: {
            userId,
            deckId: id,
          },
        });
      }

      return tx.deck.findUniqueOrThrow({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          deckTags: {
            include: { tag: true },
          },
        },
      });
    });
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
      const deletedDeck = await this.prisma.deck.delete({
        where: { id },
      });
      return { id: deletedDeck.id };
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      console.error('[DeckService] Delete error:', error);
      throw new InternalServerErrorException(
        prismaError.message ?? 'Failed to delete deck',
      );
    }
  }

  private async findMany(
    {
      page = 1,
      limit = 10,
      search = '',
      tagIds = [],
      sortBy = DeckSortBy.LAST_UPDATED,
      visibility = DeckVisibility.ALL,
      scope,
    }: GetDecksQueryDto,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.DeckWhereInput = {};
    const orderBy = this.resolveDeckOrderBy(sortBy);

    this.applyScopeFilter(where, scope, userId);
    this.applyDefaultAccessFilter(where, scope, userId);
    this.applyVisibilityFilter(where, visibility, userId);
    this.applySearchFilter(where, search);
    this.applyTagIdsFilter(where, tagIds);

    try {
      const [items, total] = await Promise.all([
        this.prisma.deck.findMany({
          where,
          skip,
          take: limit,
          orderBy,
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
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async findSingle({
    id,
    requesterId,
  }: {
    id: string;
    requesterId?: string;
  }) {
    if (!id) {
      throw new BadRequestException('Deck id is required');
    }

    const deck = await this.prisma.deck.findFirst({
      where: {
        id,
        ...(requesterId
          ? {
              OR: [{ isPublic: true }, { ownerId: requesterId }],
            }
          : { isPublic: true }),
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

    const shouldIncrementViews = deck.ownerId !== requesterId;

    if (shouldIncrementViews) {
      await this.prisma.deck.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return {
      ...deck,
      views: shouldIncrementViews ? deck.views + 1 : deck.views,
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

  private resolveDeckOrderBy(
    sortBy: DeckSortBy,
  ): Prisma.DeckOrderByWithRelationInput {
    switch (sortBy) {
      case DeckSortBy.NEWEST:
        return { createdAt: 'desc' };
      case DeckSortBy.OLDEST:
        return { createdAt: 'asc' };
      case DeckSortBy.LAST_UPDATED:
      default:
        return { updatedAt: 'desc' };
    }
  }

  private applyScopeFilter(
    where: Prisma.DeckWhereInput,
    scope: DeckScope | undefined,
    userId?: string,
  ) {
    if (!scope) {
      return;
    }

    if (scope === DeckScope.MY) {
      this.addWhereCondition(where, {
        ownerId: this.requireUserId(
          userId,
          'Authentication is required for scope=my',
        ),
      });
      return;
    }

    if (scope === DeckScope.EXPLORE) {
      this.addWhereCondition(where, { isPublic: true });

      if (userId) {
        this.addWhereCondition(where, {
          ownerId: { not: userId },
        });
      }

      return;
    }

    if (scope === DeckScope.FAVORITES) {
      const currentUserId = this.requireUserId(
        userId,
        'Authentication is required for scope=favorites',
      );

      this.addWhereCondition(where, {
        favoriteDecks: {
          some: { userId: currentUserId },
        },
      });
      this.addWhereCondition(where, {
        OR: [{ ownerId: currentUserId }, { isPublic: true }],
      });
    }
  }

  private applyDefaultAccessFilter(
    where: Prisma.DeckWhereInput,
    scope: DeckScope | undefined,
    userId?: string,
  ) {
    if (scope) {
      return;
    }

    if (!userId) {
      this.addWhereCondition(where, { isPublic: true });
      return;
    }

    this.addWhereCondition(where, {
      OR: [{ ownerId: userId }, { isPublic: true }],
    });
  }

  private applyVisibilityFilter(
    where: Prisma.DeckWhereInput,
    visibility: DeckVisibility | undefined,
    userId?: string,
  ) {
    if (!visibility || visibility === DeckVisibility.ALL) {
      return;
    }

    if (visibility === DeckVisibility.PUBLIC) {
      this.addWhereCondition(where, { isPublic: true });
      return;
    }

    const currentUserId = this.requireUserId(
      userId,
      'Authentication is required for visibility=private',
    );

    this.addWhereCondition(where, {
      ownerId: currentUserId,
      isPublic: false,
    });
  }

  private applySearchFilter(
    where: Prisma.DeckWhereInput,
    search: string | undefined,
  ) {
    const value = search?.trim();

    if (!value) {
      return;
    }

    this.addWhereCondition(where, {
      OR: [
        { title: { contains: value, mode: 'insensitive' } },
        { description: { contains: value, mode: 'insensitive' } },
      ],
    });
  }

  private applyTagIdsFilter(
    where: Prisma.DeckWhereInput,
    tagIds: string[] | undefined,
  ) {
    if (!tagIds?.length) {
      return;
    }

    this.addWhereCondition(where, {
      deckTags: {
        some: {
          tagId: {
            in: tagIds,
          },
        },
      },
    });
  }

  private addWhereCondition(
    where: Prisma.DeckWhereInput,
    condition: Prisma.DeckWhereInput,
  ) {
    const existingConditions = Array.isArray(where.AND)
      ? where.AND
      : where.AND
        ? [where.AND]
        : [];

    where.AND = [...existingConditions, condition];
  }

  private requireUserId(userId: string | undefined, message: string) {
    if (!userId) {
      throw new UnauthorizedException(message);
    }

    return userId;
  }
}
