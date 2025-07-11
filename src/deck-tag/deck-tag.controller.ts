import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DeckTagService } from './deck-tag.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

class CreateTagDto {
  name: string;
}

@ApiTags('DeckTags')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class DeckTagController {
  constructor(private readonly deckTagService: DeckTagService) {}

  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created' })
  createTag(@Body() dto: CreateTagDto) {
    return this.deckTagService.createTag(dto.name);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  getAll() {
    return this.deckTagService.getAllTags();
  }

  @Post('decks/:deckId/tags/:tagId')
  @ApiOperation({ summary: 'Attach a tag to a deck' })
  @ApiParam({ name: 'deckId', type: String })
  @ApiParam({ name: 'tagId', type: String })
  @ApiResponse({ status: 201, description: 'Tag attached to deck' })
  addTag(@Param('deckId') deckId: string, @Param('tagId') tagId: string) {
    return this.deckTagService.addTag(deckId, tagId);
  }

  @Delete('decks/:deckId/tags/:tagId')
  @ApiOperation({ summary: 'Detach a tag from a deck' })
  @ApiParam({ name: 'deckId', type: String })
  @ApiParam({ name: 'tagId', type: String })
  @ApiResponse({ status: 200, description: 'Tag detached from deck' })
  removeTag(@Param('deckId') deckId: string, @Param('tagId') tagId: string) {
    return this.deckTagService.removeTag(deckId, tagId);
  }

  @Get('decks/:deckId/tags')
  @ApiOperation({ summary: 'Get tags for a deck' })
  @ApiParam({ name: 'deckId', type: String })
  @ApiResponse({ status: 200, description: 'List of deck tags' })
  getTags(@Param('deckId') deckId: string) {
    return this.deckTagService.getTags(deckId);
  }
}
