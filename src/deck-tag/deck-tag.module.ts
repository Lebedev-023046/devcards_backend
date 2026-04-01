import { Module } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DeckTagController } from './deck-tag.controller';
import { DeckTagService } from './deck-tag.service';

@Module({
  imports: [PrismaModule],
  providers: [DeckTagService, RolesGuard],
  controllers: [DeckTagController],
})
export class DeckTagModule {}
