import { Module } from '@nestjs/common';
import { DeckTagService } from './deck-tag.service';
import { DeckTagController } from './deck-tag.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DeckTagService],
  controllers: [DeckTagController],
})
export class DeckTagModule {}
