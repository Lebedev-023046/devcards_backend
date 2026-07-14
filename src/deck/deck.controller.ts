import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { OptionalJwtGuard } from 'src/auth/guards/optional-jwt.guard';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { PatchDeckDto } from './dto/patch-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReqUser } from './decorators/req-user.decorator';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import {
  DeckDetailDto,
  DeckSummaryDto,
  PaginatedDeckDto,
} from './dto/deck-response.dto';
import {
  DeckScope,
  DeckSortBy,
  DeckVisibility,
  GetDecksQueryDto,
} from './dto/query-decks.dto';

@ApiTags('Decks')
@ApiResponse({ status: 400, type: ErrorResponseDto })
@ApiResponse({ status: 401, type: ErrorResponseDto })
@ApiResponse({ status: 403, type: ErrorResponseDto })
@ApiResponse({ status: 404, type: ErrorResponseDto })
@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get decks with filters',
    operationId: 'getDecks',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'scope', required: false, enum: DeckScope })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'react' })
  @ApiQuery({
    name: 'tagIds',
    required: false,
    type: String,
    isArray: true,
    example: ['tag-1', 'tag-2'],
    description:
      'Filter by tag ids. Supports repeated query params: `?tagIds=tag-1&tagIds=tag-2`',
  })
  @ApiQuery({ name: 'sortBy', required: false, enum: DeckSortBy })
  @ApiQuery({
    name: 'visibility',
    required: false,
    enum: DeckVisibility,
    description:
      '`all` keeps all decks in selected scope, `public` keeps only public decks, `private` keeps only private decks available to current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated (and filtered) deck list',
    type: PaginatedDeckDto,
  })
  findAll(@Query() dto: GetDecksQueryDto, @ReqUser('id') userId?: string) {
    return this.deckService.findAll(dto, userId);
  }

  @Get('favorites/ids')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get ids of decks favorited by the current user',
    operationId: 'getFavoriteDeckIds',
  })
  @ApiResponse({
    status: 200,
    description: 'List of favorite deck ids',
    schema: {
      type: 'array',
      items: { type: 'string', example: 'deck-id' },
    },
  })
  getFavoriteIds(@ReqUser('id') userId: string) {
    return this.deckService.getFavoriteIds(userId);
  }

  @Get('validate-title')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate deck title uniqueness for current user',
    operationId: 'validateDeckTitle',
  })
  @ApiQuery({
    name: 'title',
    required: true,
    type: String,
    example: 'Algorithms',
  })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    type: String,
    example: 'deck-id',
  })
  @ApiResponse({ status: 200, description: 'Deck title validation result' })
  validateTitle(
    @ReqUser('id') userId: string,
    @Query('title') title: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.deckService.validateTitle(title, userId, excludeId);
  }

  @Put(':id/favorite')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add a public deck to current user favorites',
    operationId: 'addFavoriteDeck',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Favorite state after update',
    schema: {
      type: 'object',
      properties: {
        deckId: { type: 'string', example: 'deck-id' },
        isFavorite: { type: 'boolean', example: true },
      },
    },
  })
  favorite(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.deckService.addFavorite(id, userId);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a deck from current user favorites',
    operationId: 'removeFavoriteDeck',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Favorite state after update',
    schema: {
      type: 'object',
      properties: {
        deckId: { type: 'string', example: 'deck-id' },
        isFavorite: { type: 'boolean', example: false },
      },
    },
  })
  unfavorite(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.deckService.removeFavorite(id, userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a deck by ID', operationId: 'getDeckById' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Single deck by ID',
    type: DeckDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  findOne(@Param('id') id: string, @ReqUser('id') userId?: string) {
    return this.deckService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new deck',
    operationId: 'createDeck',
  })
  @ApiBody({ type: CreateDeckDto })
  @ApiResponse({
    status: 201,
    description: 'Deck created successfully',
    type: DeckSummaryDto,
  })
  create(@Body() dto: CreateDeckDto, @ReqUser('id') userId: string) {
    return this.deckService.create(dto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Partially update a deck',
    operationId: 'patchDeck',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: PatchDeckDto })
  @ApiResponse({
    status: 200,
    description: 'Deck updated successfully',
    type: DeckSummaryDto,
  })
  patch(
    @Param('id') id: string,
    @Body() dto: PatchDeckDto,
    @ReqUser('id') userId: string,
  ) {
    return this.deckService.patch(id, dto, userId);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing deck',
    operationId: 'updateDeck',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDeckDto })
  @ApiResponse({
    status: 200,
    description: 'Deck updated successfully',
    type: DeckSummaryDto,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeckDto,
    @ReqUser('id') userId: string,
  ) {
    return this.deckService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a deck by ID',
    operationId: 'deleteDeck',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deck deleted successfully' })
  remove(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.deckService.remove(id, userId);
  }
}
