import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReqUser } from './decorators/req-user.decorator';
import { PaginationDto } from './dto/pagination.dto';
import { SearchParamsDto } from './dto/search-params.dto';

@ApiTags('Decks')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  @ApiOperation({ summary: 'Create new deck' })
  @ApiResponse({ status: 201, description: 'Deck created successfully' })
  create(@Body() dto: CreateDeckDto, @ReqUser('id') userId: string) {
    return this.deckService.create(dto, userId);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public decks (with optional search)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'query', required: false, type: String, example: 'react' })
  @ApiResponse({
    status: 200,
    description: 'Paginated (and filtered) public decks',
  })
  findAllPublic(@Query() dto: PaginationDto & SearchParamsDto) {
    const params = { limit: dto.limit, page: dto.page, query: dto.query };
    return this.deckService.findAllPublic(params);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all decks created by current user' })
  @ApiResponse({ status: 200, description: "List of user's own decks" })
  findMy(@ReqUser('id') userId: string) {
    return this.deckService.findUserDecks(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deck by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Single deck by ID' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  findOne(@Param('id') id: string) {
    return this.deckService.findOne(id);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top public decks by views' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiResponse({ status: 200, description: 'Array of top decks' })
  getTop(@Query('limit') limit = 5) {
    return this.deckService.findTopByViews(Number(limit));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deck' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deck updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateDeckDto) {
    return this.deckService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deck' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deck deleted successfully' })
  remove(@Param('id') id: string) {
    return this.deckService.remove(id);
  }
}
