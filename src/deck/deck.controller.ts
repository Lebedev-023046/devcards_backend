import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReqUser } from './decorators/req-user.decorator';
import { BulkDeleteDecksDto } from './dto/bulk-delete-decks.dto';
import { BulkUpdateDeckVisibilityDto } from './dto/bulk-update-deck-visibility.dto';
import { QueryDecksDto } from './dto/query-decks.dto';

@ApiTags('Decks')
@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get('public')
  @ApiOperation({
    summary: 'Get public decks with optional search & tag filter',
    operationId: 'getPublicDecks',
  })
  @ApiOperation({ summary: 'Get public decks (with optional search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'query', required: false, type: String, example: 'react' })
  @ApiQuery({ name: 'tagId', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated (and filtered) public decks',
  })
  findAllPublic(@Query() dto: QueryDecksDto) {
    return this.deckService.findAllPublic(dto);
  }

  @Get('public/top')
  @ApiOperation({
    summary: 'Get top public decks by view count',
    operationId: 'getTopDecks',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiResponse({ status: 200, description: 'Array of top decks' })
  getTop(@Query('limit') limit = 5) {
    return this.deckService.findTopByViews(Number(limit));
  }

  @Get('public/:id')
  @ApiOperation({
    summary: 'Get a public deck by ID',
    operationId: 'getPublicDeckById',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Single public deck by ID' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  findOnePublic(@Param('id') id: string) {
    return this.deckService.findOnePublic(id);
  }

  @Get('validate-title')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate deck title uniqueness for current user',
    operationId: 'validateDeckTitle',
  })
  validateTitle(
    @ReqUser('id') userId: string,
    @Query('title') title: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.deckService.validateTitle(title, userId, excludeId);
  }

  @Get('my')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all decks created by the current user',
    operationId: 'getMyDecks',
  })
  @ApiOperation({ summary: 'Get all decks created by current user' })
  @ApiResponse({ status: 200, description: "List of user's own decks" })
  findMy(@ReqUser('id') userId: string, @Query() dto: QueryDecksDto) {
    return this.deckService.findUserDecks(userId, dto);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a deck by ID', operationId: 'getDeckById' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Single deck by ID' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  findOne(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.deckService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new deck',
    operationId: 'createDeck',
  })
  @ApiResponse({ status: 201, description: 'Deck created successfully' })
  create(@Body() dto: CreateDeckDto, @ReqUser('id') userId: string) {
    return this.deckService.create(dto, userId);
  }

  @Patch('bulk/visibility')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk update visibility for decks owned by current user',
    operationId: 'bulkUpdateDeckVisibility',
  })
  bulkUpdateVisibility(
    @Body() dto: BulkUpdateDeckVisibilityDto,
    @ReqUser('id') userId: string,
  ) {
    return this.deckService.bulkUpdateVisibility(dto, userId);
  }

  @Delete('bulk')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk delete decks owned by current user',
    operationId: 'bulkDeleteDecks',
  })
  bulkDelete(@Body() dto: BulkDeleteDecksDto, @ReqUser('id') userId: string) {
    return this.deckService.bulkDelete(dto.ids, userId);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing deck',
    operationId: 'updateDeck',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deck updated successfully' })
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
