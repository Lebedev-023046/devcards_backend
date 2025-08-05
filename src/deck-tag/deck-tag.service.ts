// src/deck-tag/deck-tag.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeckTagService {
  constructor(private prisma: PrismaService) {}

  async getAllTags({ page = 1, limit = 10, search }: any) {
    const where = search
      ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {};
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.tag.count(),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      data: tags,
      total,
      page,
      lastPage,
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
