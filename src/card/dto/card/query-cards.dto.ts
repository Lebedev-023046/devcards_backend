import { ApiPropertyOptional } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SortOrder } from 'src/deck/dto/query-decks.dto';

export enum CardSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  QUESTION = 'question',
  TYPE = 'type',
}

export class QueryCardsDto {
  @ApiPropertyOptional({ example: 'deck-id' })
  @IsOptional()
  @IsString()
  deckId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'props' })
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

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
