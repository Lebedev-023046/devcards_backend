import { ApiPropertyOptional } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateOptionDto } from '../option/create-option.dto';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'What hook stores component-local state in React?',
  })
  question?: string;

  @IsOptional()
  @IsEnum(CardType)
  @ApiPropertyOptional({
    enum: CardType,
    example: CardType.INFO,
    description:
      'When changing type, provide the payload required by the target type.',
  })
  type?: CardType;

  @ValidateIf((dto: UpdateCardDto) => dto.type === CardType.INFO)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'useState stores component-local state.',
    description:
      'Required when changing a card to INFO. Optional when updating an existing INFO answer.',
  })
  answer?: string;

  @ValidateIf(
    (dto: UpdateCardDto) =>
      dto.options !== undefined ||
      (dto.type !== undefined && dto.type !== CardType.INFO),
  )
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @ApiPropertyOptional({
    type: [CreateOptionDto],
    description:
      'Required when changing a card to SINGLE_CHOICE or MULTI_CHOICE. Optional when replacing options for an existing choice card.',
  })
  options?: CreateOptionDto[];
}
