import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { DeckTagService } from './deck-tag.service';

class CreateTagDto {
  name: string;
}

@ApiTags('DeckTags')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class DeckTagController {
  constructor(private readonly deckTagService: DeckTagService) {}

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags', operationId: 'getAllDeckTags' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.deckTagService.getAllTags({ page, limit, search });
  }

  @Get('decks/:deckId/tags')
  @ApiOperation({
    summary: 'Get tags for a deck',
    operationId: 'getOneDeckTags',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiResponse({ status: 200, description: 'List of deck tags' })
  getTags(@Param('deckId') deckId: string) {
    return this.deckTagService.getTags(deckId);
  }

  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag', operationId: 'createDeckTag' })
  @ApiResponse({ status: 201, description: 'Tag created' })
  createTag(@Body() dto: CreateTagDto) {
    return this.deckTagService.createTag(dto.name);
  }

  @Post('decks/:deckId/tags/:tagId')
  @ApiOperation({
    summary: 'Attach a tag to a deck',
    operationId: 'addDeckTag',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiParam({ name: 'tagId', type: String })
  @ApiResponse({ status: 201, description: 'Tag attached to deck' })
  addTag(@Param('deckId') deckId: string, @Param('tagId') tagId: string) {
    return this.deckTagService.addTag(deckId, tagId);
  }

  @Delete('decks/:deckId/tags/:tagId')
  @ApiOperation({
    summary: 'Detach a tag from a deck',
    operationId: 'deleteDeckTag',
  })
  @ApiParam({ name: 'deckId', type: String })
  @ApiParam({ name: 'tagId', type: String })
  @ApiResponse({ status: 200, description: 'Tag detached from deck' })
  removeTag(@Param('deckId') deckId: string, @Param('tagId') tagId: string) {
    return this.deckTagService.removeTag(deckId, tagId);
  }
}
