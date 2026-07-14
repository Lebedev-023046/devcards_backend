import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateOptionDto } from '../option/create-option.dto';

export class CreateCardDto {
  @IsString()
  @ApiProperty({
    example: 'deck-id',
    description: 'Deck where the card will be created',
  })
  deckId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'What hook stores local state in React?',
  })
  question: string;

  @IsEnum(CardType)
  @ApiProperty({
    enum: CardType,
    example: CardType.SINGLE_CHOICE,
    description: 'Determines which answer payload is required',
  })
  type: CardType;

  @ValidateIf((dto: CreateCardDto) => dto.type === CardType.INFO)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'useState stores component-local state.',
    description: 'Required for INFO cards. Not used for choice cards.',
  })
  answer?: string;

  @ValidateIf((dto: CreateCardDto) => dto.type !== CardType.INFO)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @ApiPropertyOptional({
    type: [CreateOptionDto],
    description:
      'Required for SINGLE_CHOICE and MULTI_CHOICE cards. Not used for INFO cards.',
  })
  options?: CreateOptionDto[];
}
