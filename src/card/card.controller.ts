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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { ReqUser } from 'src/deck/decorators/req-user.decorator';
import { CardService } from './card.service';
import { BulkDeleteCardsDto } from './dto/card/bulk-delete-cards.dto';
import {
  CardResponseDto,
  PaginatedCardsDto,
} from './dto/card/card-response.dto';
import { CreateCardDto } from './dto/card/create-card.dto';
import { QueryCardsDto } from './dto/card/query-cards.dto';
import { UpdateCardDto } from './dto/card/update-card.dto';

@ApiTags('Cards')
@ApiBearerAuth()
@ApiResponse({ status: 400, type: ErrorResponseDto })
@ApiResponse({ status: 401, type: ErrorResponseDto })
@ApiResponse({ status: 403, type: ErrorResponseDto })
@ApiResponse({ status: 404, type: ErrorResponseDto })
@UseGuards(JwtGuard)
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated cards with deck, search and type filters',
    operationId: 'getCards',
  })
  @ApiQuery({
    name: 'deckId',
    required: false,
    type: String,
    example: 'deck-id',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'state' })
  @ApiQuery({
    name: 'query',
    required: false,
    type: String,
    example: 'state',
    description: 'Legacy alias for search. Prefer `search`.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['SINGLE_CHOICE', 'MULTI_CHOICE', 'INFO'],
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'question', 'type'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of cards',
    type: PaginatedCardsDto,
  })
  findAll(@Query() query: QueryCardsDto, @ReqUser('id') userId: string) {
    return this.cardService.findAll(query, userId);
  }

  @Get('validate-question')
  @ApiOperation({
    summary: 'Validate card question uniqueness inside a deck',
    operationId: 'validateCardQuestion',
  })
  @ApiQuery({
    name: 'deckId',
    required: true,
    type: String,
    example: 'deck-id',
  })
  @ApiQuery({
    name: 'question',
    required: true,
    type: String,
    example: 'What is React?',
  })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    type: String,
    example: 'card-id',
  })
  @ApiResponse({ status: 200, description: 'Card question validation result' })
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
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Single card by ID',
    type: CardResponseDto,
  })
  findOne(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.cardService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new card',
    operationId: 'createCard',
  })
  @ApiBody({
    type: CreateCardDto,
    examples: {
      singleChoice: {
        summary: 'Single choice card',
        value: {
          deckId: 'deck-id',
          question: 'What hook stores local state in React?',
          type: 'SINGLE_CHOICE',
          options: [
            { text: 'useState', isCorrect: true },
            { text: 'useEffect', isCorrect: false },
          ],
        },
      },
      multiChoice: {
        summary: 'Multi choice card',
        value: {
          deckId: 'deck-id',
          question: 'Which are JavaScript primitive types?',
          type: 'MULTI_CHOICE',
          options: [
            { text: 'string', isCorrect: true },
            { text: 'number', isCorrect: true },
            { text: 'array', isCorrect: false },
          ],
        },
      },
      info: {
        summary: 'Info card',
        value: {
          deckId: 'deck-id',
          question: 'What does useEffect do?',
          type: 'INFO',
          answer: 'useEffect runs side effects after render.',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid card payload for the selected card type',
  })
  @ApiResponse({
    status: 201,
    description: 'Card created successfully',
    type: CardResponseDto,
  })
  create(@Body() dto: CreateCardDto, @ReqUser('id') userId: string) {
    return this.cardService.create(dto, userId);
  }

  @Post('/bulk')
  @ApiOperation({
    summary: 'Create new cards in bulk',
    operationId: 'createCards',
  })
  @ApiBody({
    type: [CreateCardDto],
    examples: {
      mixedCards: {
        summary: 'Bulk create cards in one deck',
        value: [
          {
            deckId: 'deck-id',
            question: 'What hook stores local state in React?',
            type: 'SINGLE_CHOICE',
            options: [
              { text: 'useState', isCorrect: true },
              { text: 'useMemo', isCorrect: false },
            ],
          },
          {
            deckId: 'deck-id',
            question: 'What does useEffect do?',
            type: 'INFO',
            answer: 'useEffect runs side effects after render.',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid bulk card payload',
  })
  @ApiResponse({
    status: 201,
    description: 'Cards created successfully',
    type: [CardResponseDto],
  })
  createMany(@Body() dto: CreateCardDto[], @ReqUser('id') userId: string) {
    return this.cardService.createMany(dto, userId);
  }

  @Delete('/bulk')
  @ApiOperation({
    summary: 'Delete cards in bulk',
    operationId: 'bulkDeleteCards',
  })
  @ApiResponse({ status: 200, description: 'Bulk delete result' })
  bulkDelete(@Body() dto: BulkDeleteCardsDto, @ReqUser('id') userId: string) {
    return this.cardService.bulkDelete(dto.ids, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing card',
    operationId: 'updateCard',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    type: UpdateCardDto,
    examples: {
      updateQuestion: {
        summary: 'Update only question',
        value: {
          question: 'What hook stores component-local state in React?',
        },
      },
      changeToInfo: {
        summary: 'Change card to INFO',
        value: {
          type: 'INFO',
          answer: 'useState stores component-local state.',
        },
      },
      replaceSingleChoiceOptions: {
        summary: 'Replace choice options',
        value: {
          type: 'SINGLE_CHOICE',
          options: [
            { text: 'useState', isCorrect: true },
            { text: 'useRef', isCorrect: false },
          ],
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid card update payload for the selected card type',
  })
  @ApiResponse({
    status: 200,
    description: 'Card updated successfully',
    type: CardResponseDto,
  })
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
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Card deleted successfully' })
  remove(@Param('id') id: string, @ReqUser('id') userId: string) {
    return this.cardService.remove(id, userId);
  }
}
