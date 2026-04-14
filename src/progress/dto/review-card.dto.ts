import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewCardDto {
  @ApiPropertyOptional({
    description: 'Marks an INFO card as viewed',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  viewed?: boolean;

  @ApiPropertyOptional({
    description: 'Selected option id for SINGLE_CHOICE cards',
    example: 'option_123',
  })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({
    description: 'Selected option ids for MULTI_CHOICE cards',
    example: ['option_1', 'option_2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  answers?: string[];
}
