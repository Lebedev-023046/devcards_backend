import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateDeckDto {
  @ApiProperty({
    example: 'Frontend Interview Questions',
    description: 'Deck title shown to users',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @ApiProperty({
    example: 'A collection of questions for frontend interviews',
    description: 'Short description of the deck',
  })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    example: true,
    description: 'Whether the deck is visible in the public catalog',
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({
    example: ['tagId1', 'tagId2'],
    description: 'List of tag ids assigned to the deck',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  tagIds: string[];

  @ApiProperty({
    example: '/uploads/deck-covers/frontend-interview.png',
    description: 'Public URL of the uploaded deck cover image',
  })
  @IsString()
  coverImageUrl: string;
}
