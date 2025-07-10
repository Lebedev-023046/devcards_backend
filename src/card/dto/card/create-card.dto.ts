import {
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOptionDto } from '../option/create-option.dto';
import { CardType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  question: string;

  @IsEnum(CardType)
  @ApiProperty({ enum: CardType })
  type: CardType;

  @IsString()
  @ApiProperty()
  deckId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @ApiProperty({ type: [CreateOptionDto] })
  options: CreateOptionDto[];
}
