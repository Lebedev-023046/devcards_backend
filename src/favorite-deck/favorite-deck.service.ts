import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type PrismaError = {
  code?: string;
};

@Injectable()
export class FavoriteDeckService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavoriteDecks(userId: string) {
    return this.prisma.favoriteDeck.findMany({
      where: { userId },
      include: {
        deck: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getFavoriteDeckIds(userId: string) {
    return this.prisma.favoriteDeck.findMany({
      where: { userId },
      select: { deckId: true },
    });
  }

  async addFavoriteDeck(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) throw new NotFoundException(`Deck ${deckId} not found`);
    if (!userId) throw new NotFoundException(`User ${userId} not found`);

    try {
      return await this.prisma.favoriteDeck.create({
        data: { userId, deckId },
      });
    } catch (error: unknown) {
      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2002') {
        throw new ConflictException('Deck already added to favorites');
      }

      throw error;
    }
  }

  async removeFavoriteDeck(userId: string, deckId: string) {
    const result = await this.prisma.favoriteDeck.deleteMany({
      where: { userId, deckId },
    });
    return { removed: result.count };
  }
}
