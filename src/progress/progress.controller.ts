import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { ReviewCardDto } from './dto/review-card.dto';
import { ProgressService } from './progress.service';
import { ProgressFilter } from './types/filter';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('decks/:deckId/progress')
  @ApiOperation({
    summary: 'Get user progress for a deck',
    operationId: 'getDeckProgress',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['all', 'learned', 'inProgress', 'notStarted'],
  })
  @ApiResponse({ status: 200, description: 'Deck progress data' })
  async getDeckProgress(
    @ReqUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Query('filter') filter?: ProgressFilter,
  ) {
    return this.progressService.getDeckProgress(userId, deckId, filter);
  }

  @Post('cards/:cardId/review')
  @ApiOperation({
    summary: 'Submit review result for a card',
    operationId: 'addCardReview',
  })
  @ApiParam({ name: 'cardId', type: String })
  @ApiResponse({ status: 201, description: 'Review recorded' })
  async reviewCard(
    @ReqUser('id') userId: string,
    @Param('cardId') cardId: string,
    @Body() dto: ReviewCardDto,
  ) {
    return this.progressService.reviewCard(userId, cardId, dto);
  }

  @Delete('decks/:deckId/progress')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Reset user progress for a deck',
    operationId: 'resetDeckProgress',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiResponse({ status: 204, description: 'Progress reset successfully' })
  async resetDeckProgress(
    @ReqUser('id') userId: string,
    @Param('deckId') deckId: string,
  ) {
    await this.progressService.resetDeckProgress(userId, deckId);
  }
}
