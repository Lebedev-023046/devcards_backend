import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  getAllCards() {
    return this.prisma.card.findMany({
      include: {
        options: true,
      },
    });
  }
}
