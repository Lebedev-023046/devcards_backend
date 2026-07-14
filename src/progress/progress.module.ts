import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DeckModule } from 'src/deck/deck.module';

@Module({
  imports: [PrismaModule, DeckModule],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}
