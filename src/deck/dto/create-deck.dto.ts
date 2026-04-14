import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDeckDto {
  @ApiProperty({
    example: 'Frontend Interview Questions',
    description: 'Deck title shown to users',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({
    example: 'A collection of questions for frontend interviews',
    description: 'Optional short description of the deck',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the deck is visible in the public catalog',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    example: ['tagId1', 'tagId2'],
    description: 'List of tag ids assigned to the deck',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  tagIds?: string[];

  @ApiPropertyOptional({
    example: '/uploads/deck-covers/frontend-interview.png',
    description: 'Public URL of the uploaded deck cover image',
  })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
