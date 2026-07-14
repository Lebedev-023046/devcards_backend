import { ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PatchDeckDto {
  @ApiPropertyOptional({
    example: 'Frontend Interview Questions',
    description: 'Deck title shown to users',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    example: 'A collection of questions for frontend interviews',
    description: 'Optional short description of the deck. Use null to clear it',
    nullable: true,
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the deck is visible in the public catalog',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
