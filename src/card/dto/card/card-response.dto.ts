import { ApiProperty } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class CardOptionDto {
  @ApiProperty({ example: 'option-id' })
  id: string;

  @ApiProperty({ example: 'useState' })
  text: string;

  @ApiProperty({ example: true })
  isCorrect: boolean;

  @ApiProperty({ example: '2026-04-08T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-08T10:00:00.000Z' })
  updatedAt: string;
}

export class CardResponseDto {
  @ApiProperty({ example: 'card-id' })
  id: string;

  @ApiProperty({ example: 'What hook stores local state in React?' })
  question: string;

  @ApiProperty({ enum: CardType, example: CardType.SINGLE_CHOICE })
  type: CardType;

  @ApiProperty({
    example: 'State is stored with useState',
    nullable: true,
    required: false,
  })
  answer?: string | null;

  @ApiProperty({ example: 'deck-id' })
  deckId: string;

  @ApiProperty({ example: '2026-04-08T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-08T10:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ type: [CardOptionDto] })
  options: CardOptionDto[];
}

export class PaginatedCardsDto {
  @ApiProperty({ type: [CardResponseDto] })
  items: CardResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
