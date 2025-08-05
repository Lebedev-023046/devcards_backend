import { ApiProperty } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOptionDto } from '../option/create-option.dto';

export class CreateCardDto {
  @IsString()
  @ApiProperty()
  deckId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  question: string;

  @IsEnum(CardType)
  @ApiProperty({ enum: CardType })
  type: CardType;

  @IsString()
  @ApiProperty({ required: false })
  answer?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @ApiProperty({ type: [CreateOptionDto] })
  options?: CreateOptionDto[];
}
