import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  Delete,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReqUser } from 'src/deck/decorators/req-user.decorator';
import { ReviewCardDto } from './dto/review-card.dto';
import { ProgressFilter } from './types/filter';

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('cards/:cardId/review')
  @ApiOperation({ summary: 'Submit review result for a card' })
  @ApiResponse({ status: 201, description: 'Review recorded' })
  async reviewCard(
    @ReqUser('id') userId: string,
    @Param('cardId') cardId: string,
    @Body() dto: ReviewCardDto,
  ) {
    return this.progressService.reviewCard(userId, cardId, dto);
  }

  @Get('decks/:deckId/progress')
  @ApiOperation({ summary: 'Get user progress for a deck' })
  @ApiResponse({ status: 200, description: 'Deck progress data' })
  async getDeckProgress(
    @ReqUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Query('filter') filter?: ProgressFilter,
  ) {
    return this.progressService.getDeckProgress(userId, deckId, filter);
  }

  @Delete('decks/:deckId/progress')
  @ApiOperation({ summary: 'Reset user progress for a deck' })
  @ApiResponse({ status: 200, description: 'Progress reset successfully' })
  async resetDeckProgress(
    @ReqUser('id') userId: string,
    @Param('deckId') deckId: string,
  ) {
    await this.progressService.resetDeckProgress(userId, deckId);
    return { success: true };
  }
}
