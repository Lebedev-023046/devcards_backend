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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { DeckTagService } from './deck-tag.service';
import { PaginatedTagsDto, TagResponseDto } from './dto/tag-response.dto';

class CreateTagDto {
  @ApiProperty({ example: 'React' })
  name: string;
}

class UpdateTagDto {
  @ApiProperty({ example: 'React Advanced' })
  name: string;
}

@ApiTags('DeckTags')
@Controller('decks-tags')
export class DeckTagController {
  constructor(private readonly deckTagService: DeckTagService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags', operationId: 'getAllDeckTags' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'react' })
  @ApiResponse({
    status: 200,
    description: 'List of tags',
    type: PaginatedTagsDto,
  })
  getAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    console.log({ limit });
    return this.deckTagService.getAllTags({ page, limit, search });
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new tag', operationId: 'createDeckTag' })
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({
    status: 201,
    description: 'Tag created',
    type: TagResponseDto,
  })
  createTag(@Body() dto: CreateTagDto) {
    return this.deckTagService.createTag(dto.name);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update tag', operationId: 'updateDeckTag' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({
    status: 200,
    description: 'Tag updated',
    type: TagResponseDto,
  })
  updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.deckTagService.updateTag(id, dto.name);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete tag', operationId: 'deleteTag' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted',
    type: TagResponseDto,
  })
  deleteTag(@Param('id') id: string) {
    return this.deckTagService.deleteTag(id);
  }
}
