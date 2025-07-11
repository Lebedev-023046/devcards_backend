import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { CardModule } from './card/card.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DeckModule } from './deck/deck.module';
import { ProgressModule } from './progress/progress.module';
import { FavoriteDeckModule } from './favorite-deck/favorite-deck.module';
import { DeckTagModule } from './deck-tag/deck-tag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CardModule,
    DeckModule,
    ProgressModule,
    FavoriteDeckModule,
    DeckTagModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
