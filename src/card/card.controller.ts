import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/card/create-card.dto';
import { UpdateCardDto } from './dto/card/update-card.dto';
import {
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaginationDto } from './dto/card/pagination.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('/by-deck/:deckId')
  @ApiParam({ name: 'deckId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated cards in the deck' })
  findAllByDeck(
    @Param('deckId') deckId: string,
    @Query() query: PaginationDto,
  ) {
    return this.cardService.findAllInDeck(deckId, query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Single card by ID' })
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  create(@Body() dto: CreateCardDto) {
    return this.cardService.create(dto);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Card updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Card deleted successfully' })
  remove(@Param('id') id: string) {
    return this.cardService.remove(id);
  }
}
