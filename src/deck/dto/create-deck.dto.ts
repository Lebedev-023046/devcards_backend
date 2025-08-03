import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDeckDto {
  @ApiProperty({
    example: 'Frontend Interview Questions',
    description: 'Title of the deck',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'A collection of questions for frontend interviews',
    description: 'Optional description of the deck',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: true,
    description: 'Whether the deck is publicly visible',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ example: ['tagId1', 'tagId2'], required: false })
  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({ example: 'https://...', required: false })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiProperty({
    example: [
      { question: 'What is JSX?', answer: 'JSX is ...', type: 'open' },
      { question: 'React is a library?', answer: 'true', type: 'boolean' },
    ],
    required: false,
  })
  @IsOptional()
  cards?: Array<{
    question: string;
    answer: string;
    type: 'open' | 'boolean' | 'multipleChoice';
  }>;
}
