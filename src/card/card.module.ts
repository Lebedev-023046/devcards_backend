import { Module } from '@nestjs/common';
import { DeckModule } from 'src/deck/deck.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';

@Module({
  imports: [PrismaModule, DeckModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
