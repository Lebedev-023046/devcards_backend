import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoriteDeckService {
  constructor(private readonly prisma: PrismaService) {}

  async addFavoriteDeck(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException(`Deck ${deckId} not found`);

    return this.prisma.favoriteDeck.create({
      data: { userId, deckId },
    });
  }

  async removeFavoriteDeck(userId: string, deckId: string) {
    const result = await this.prisma.favoriteDeck.deleteMany({
      where: { userId, deckId },
    });
    return { removed: result.count };
  }

  async getFavoriteDecks(userId: string) {
    return this.prisma.favoriteDeck.findMany({
      where: { userId },
      include: {
        deck: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
