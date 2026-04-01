import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadService } from 'src/upload/upload.service';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';

@Module({
  imports: [PrismaModule],
  controllers: [DeckController],
  providers: [DeckService, UploadService],
})
export class DeckModule {}
