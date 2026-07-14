import { ApiPropertyOptional } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum CardSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum CardSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  QUESTION = 'question',
  TYPE = 'type',
}

export class QueryCardsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'deck-id' })
  @IsOptional()
  @IsString()
  deckId?: string;

  @ApiPropertyOptional({ example: 'props' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'props',
    description: 'Legacy alias for search. Prefer `search`.',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: CardType })
  @IsOptional()
  @IsEnum(CardType)
  type?: CardType;

  @ApiPropertyOptional({ enum: CardSortBy, default: CardSortBy.UPDATED_AT })
  @IsOptional()
  @IsEnum(CardSortBy)
  sortBy?: CardSortBy = CardSortBy.UPDATED_AT;

  @ApiPropertyOptional({ enum: CardSortOrder, default: CardSortOrder.DESC })
  @IsOptional()
  @IsEnum(CardSortOrder)
  sortOrder?: CardSortOrder = CardSortOrder.DESC;
}
