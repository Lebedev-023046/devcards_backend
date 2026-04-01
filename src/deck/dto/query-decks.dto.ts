import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum DeckSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
  VIEWS = 'views',
  TOTAL_REVIEWS = 'totalReviews',
  TOTAL_CARDS = 'totalCards',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryDecksDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;

  @ApiPropertyOptional({ example: 'react hooks' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 'cm123tag' })
  @IsOptional()
  @IsString()
  tagId?: string;

  @ApiPropertyOptional({ enum: DeckSortBy, default: DeckSortBy.UPDATED_AT })
  @IsOptional()
  @IsEnum(DeckSortBy)
  sortBy?: DeckSortBy = DeckSortBy.UPDATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;
}
