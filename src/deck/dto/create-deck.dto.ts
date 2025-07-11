import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

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
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the deck is publicly visible',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
