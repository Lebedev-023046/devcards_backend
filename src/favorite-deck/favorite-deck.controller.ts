import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from 'src/auth/guards/jwt.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FavoriteDeckService } from './favorite-deck.service';
import { ReqUser } from 'src/deck/decorators/req-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class FavoriteDeckController {
  constructor(private readonly favoriteService: FavoriteDeckService) {}

  @Post('decks/:deckId/favorite')
  @ApiOperation({ summary: 'Add deck to favorites' })
  @ApiParam({ name: 'deckId', type: String })
  @ApiResponse({ status: 201, description: 'Deck favorited' })
  addFavorite(@ReqUser('id') userId: string, @Param('deckId') deckId: string) {
    return this.favoriteService.addFavoriteDeck(userId, deckId);
  }

  @Delete('decks/:deckId/favorite')
  @ApiOperation({ summary: 'Remove deck from favorites' })
  @ApiParam({ name: 'deckId', type: String })
  @ApiResponse({ status: 200, description: 'Deck unfavorited' })
  removeFavorite(
    @ReqUser('id') userId: string,
    @Param('deckId') deckId: string,
  ) {
    return this.favoriteService.removeFavoriteDeck(userId, deckId);
  }

  @Get('decks/favorites')
  @ApiOperation({ summary: 'Get all favorite decks' })
  @ApiResponse({ status: 200, description: 'List of favorites with deck data' })
  getFavorites(@ReqUser('id') userId: string) {
    return this.favoriteService.getFavoriteDecks(userId);
  }
}
