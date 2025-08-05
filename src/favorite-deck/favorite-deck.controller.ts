import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from 'src/auth/guards/jwt.guard';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReqUser } from 'src/deck/decorators/req-user.decorator';
import { FavoriteDeckService } from './favorite-deck.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class FavoriteDeckController {
  constructor(private readonly favoriteService: FavoriteDeckService) {}

  @Get('me/decks/favorites')
  @ApiOperation({
    summary: 'Get all favorite decks',
    operationId: 'getFavoriteDecks',
  })
  @ApiResponse({ status: 200, description: 'List of favorites with deck data' })
  getFavorites(@ReqUser('id') userId: string) {
    return this.favoriteService.getFavoriteDecks(userId);
  }

  @Get('me/decks/favorites/ids')
  @ApiOperation({
    summary: 'Get all favorite deck ids',
    operationId: 'getFavoriteDeckIds',
  })
  @ApiResponse({ status: 200, description: 'List of favorite deck ids' })
  getFavoriteDeckIds(@ReqUser('id') userId: string) {
    return this.favoriteService.getFavoriteDeckIds(userId);
  }

  @Post('/me/decks/favorites')
  @ApiOperation({
    summary: 'Add deck to favorites',
    operationId: 'addFavoriteDeck',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiResponse({ status: 201, description: 'Deck favorited' })
  addFavorite(@ReqUser('id') userId: string, @Body('deckId') deckId: string) {
    return this.favoriteService.addFavoriteDeck(userId, deckId);
  }
  @Delete('/me/decks/favorites/:deckId')
  @ApiOperation({
    summary: 'Remove deck from favorites',
    operationId: 'removeFavoriteDeck',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiResponse({ status: 200, description: 'Deck unfavorited' })
  removeFavorite(
    @ReqUser('id') userId: string,
    @Param('deckId') deckId: string,
  ) {
    return this.favoriteService.removeFavoriteDeck(userId, deckId);
  }
}
