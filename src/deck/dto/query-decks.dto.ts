import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ToStringArrayQuery } from 'src/common/query/query-transformers';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum DeckSortBy {
  LAST_UPDATED = 'last_updated',
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export enum DeckScope {
  MY = 'my',
  EXPLORE = 'explore',
  FAVORITES = 'favorites',
}

export enum DeckVisibility {
  ALL = 'all',
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export class GetDecksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;

  @ApiPropertyOptional({
    enum: DeckScope,
    description: 'Business dataset scope for deck list',
  })
  @IsOptional()
  @IsEnum(DeckScope)
  scope?: DeckScope;

  @ApiPropertyOptional({ example: 'react hooks' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: ['tag-1', 'tag-2'],
    type: [String],
    description:
      'Filter by several tag ids. Supports repeated query params or comma-separated values',
  })
  @IsOptional()
  @ToStringArrayQuery()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  tagIds?: string[];

  @ApiPropertyOptional({ enum: DeckSortBy, default: DeckSortBy.LAST_UPDATED })
  @IsOptional()
  @IsEnum(DeckSortBy)
  sortBy?: DeckSortBy = DeckSortBy.LAST_UPDATED;

  @ApiPropertyOptional({ enum: DeckVisibility, default: DeckVisibility.ALL })
  @IsOptional()
  @IsEnum(DeckVisibility)
  visibility?: DeckVisibility = DeckVisibility.ALL;
}
