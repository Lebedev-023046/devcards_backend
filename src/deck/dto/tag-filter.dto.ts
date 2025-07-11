import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TagFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'ID тега для фильтрации' })
  tagId?: string;
}
