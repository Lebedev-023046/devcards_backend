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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ReqUser } from 'src/deck/decorators/req-user.decorator';
import { CardService } from './card.service';
import { BulkDeleteCardsDto } from './dto/card/bulk-delete-cards.dto';
import { CreateCardDto } from './dto/card/create-card.dto';
import { PaginationDto } from './dto/card/pagination.dto';
import { QueryCardsDto } from './dto/card/query-cards.dto';
import { UpdateCardDto } from './dto/card/update-card.dto';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated cards with deck, search and type filters',
    operationId: 'getCards',
  })
  findAll(@Query() query: QueryCardsDto, @ReqUser('id') userId: string) {
    return this.cardService.findAll(query, userId);
  }

  @Get('/by-deck/:deckId')
  @ApiOperation({
    summary: 'Get paginated list of cards in a deck',
    operationId: 'getAllCardsByDeck',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated cards in the deck' })
  findAllByDeck(
    @Param('deckId') deckId: string,
    @Query() query: PaginationDto,
    @ReqUser('id') userId: string,
  ) {
    return this.cardService.findAllInDeck(deckId, query, userId);
  }

  @Get('validate-question')
  @ApiOperation({
    summary: 'Validate card question uniqueness inside a deck',
    operationId: 'validateCardQuestion',
  })
  validateQuestion(
    @Query('deckId') deckId: string,
    @Query('question') question: string,
    @ReqUser('id') userId: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.cardService.validateQuestion(
      deckId,
      question,
      userId,
      excludeId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single card by ID',
    operationId: 'getCardById',
  })
  @ApiResponse({ status: 200, description: 'Single card by ID' })
  findOne(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.cardService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new card',
    operationId: 'createCard',
  })
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  create(@Body() dto: CreateCardDto, @ReqUser('id') userId: string) {
    return this.cardService.create(dto, userId);
  }

  @Post('/bulk')
  @ApiOperation({
    summary: 'Create new cards in bulk',
    operationId: 'createCards',
  })
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  createMany(@Body() dto: CreateCardDto[], @ReqUser('id') userId: string) {
    return this.cardService.createMany(dto, userId);
  }

  @Delete('/bulk')
  @ApiOperation({
    summary: 'Delete cards in bulk',
    operationId: 'bulkDeleteCards',
  })
  bulkDelete(@Body() dto: BulkDeleteCardsDto, @ReqUser('id') userId: string) {
    return this.cardService.bulkDelete(dto.ids, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing card',
    operationId: 'updateCard',
  })
  @ApiResponse({ status: 200, description: 'Card updated successfully' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @ReqUser('id') userId: string,
  ) {
    return this.cardService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a card by ID',
    operationId: 'deleteCard',
  })
  @ApiResponse({ status: 200, description: 'Card deleted successfully' })
  remove(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.cardService.remove(id, userId);
  }
}
