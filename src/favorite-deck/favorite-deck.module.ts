// src/favorite/favorite.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { FavoriteDeckService } from './favorite-deck.service';
import { FavoriteDeckController } from './favorite-deck.controller';

@Module({
  imports: [PrismaModule],
  providers: [FavoriteDeckService],
  controllers: [FavoriteDeckController],
})
export class FavoriteDeckModule {}
