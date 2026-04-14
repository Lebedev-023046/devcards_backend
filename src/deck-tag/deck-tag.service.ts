// src/deck-tag/deck-tag.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type GetAllTagsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

@Injectable()
export class DeckTagService {
  constructor(private prisma: PrismaService) {}

  async getAllTags({ page = 1, limit = 10, search }: GetAllTagsParams) {
    const shouldFetchAll = limit === Infinity;
    const skip = shouldFetchAll ? undefined : (page - 1) * limit;
    const take = shouldFetchAll ? undefined : limit;

    const where: Prisma.TagWhereInput = search
      ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {};

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip,
        take,
      }),
      this.prisma.tag.count({ where }),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      items: tags,
      meta: {
        total,
        page,
        limit,
        lastPage,
      },
    };
  }

  async getTags(deckId: string) {
    return this.prisma.deckTag.findMany({
      where: { deckId },
      include: { tag: true },
      orderBy: { tag: { name: 'asc' } },
    });
  }

  async createTag(name: string) {
    return this.prisma.tag.create({ data: { name } });
  }

  async updateTag(id: string, name: string) {
    return this.prisma.tag.update({
      where: { id },
      data: { name },
    });
  }

  async deleteTag(id: string) {
    return this.prisma.tag.delete({
      where: { id },
    });
  }

  async addTag(deckId: string, tagId: string) {
    const [deck, tag] = await Promise.all([
      this.prisma.deck.findUnique({ where: { id: deckId } }),
      this.prisma.tag.findUnique({ where: { id: tagId } }),
    ]);
    if (!deck) throw new NotFoundException(`Deck ${deckId} not found`);
    if (!tag) throw new NotFoundException(`Tag ${tagId} not found`);

    return this.prisma.deckTag.create({
      data: { deckId, tagId },
    });
  }

  async removeTag(deckId: string, tagId: string) {
    const result = await this.prisma.deckTag.deleteMany({
      where: { deckId, tagId },
    });
    return { removed: result.count };
  }
}
