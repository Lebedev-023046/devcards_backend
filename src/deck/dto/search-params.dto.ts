import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchParamsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Text to search in title or description',
  })
  query?: string;
}
