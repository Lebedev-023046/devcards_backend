import { CardType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class DeckOwnerDto {
  @ApiProperty({ example: 'user-id' })
  id: string;

  @ApiProperty({ example: 'Dmitry' })
  name: string;
}

export class DeckTagDto {
  @ApiProperty({ example: 'tag-id' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 'Code2' })
  icon: string;
}

export class DeckTagRelationDto {
  @ApiProperty({ example: 'deck-id' })
  deckId: string;

  @ApiProperty({ example: 'tag-id' })
  tagId: string;

  @ApiProperty({ type: DeckTagDto })
  tag: DeckTagDto;
}

export class DeckPermissionsDto {
  @ApiProperty({ example: true })
  canEdit: boolean;

  @ApiProperty({ example: true })
  canDelete: boolean;

  @ApiProperty({ example: true })
  canPractice: boolean;

  @ApiProperty({ example: false })
  canFavorite: boolean;
}

export class DeckOptionDto {
  @ApiProperty({ example: 'option-id' })
  id: string;

  @ApiProperty({ example: 'useState' })
  text: string;

  @ApiProperty({ example: true })
  isCorrect: boolean;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  updatedAt: string;
}

export class DeckCardDto {
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

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ type: [DeckOptionDto] })
  options: DeckOptionDto[];
}

export class DeckSummaryDto {
  @ApiProperty({ example: 'deck-id' })
  id: string;

  @ApiProperty({ example: 'Frontend Interview Questions' })
  title: string;

  @ApiProperty({ example: 'A collection of questions for frontend interviews' })
  description: string;

  @ApiProperty({ example: true })
  isPublic: boolean;

  @ApiProperty({ example: '/uploads/deck-covers/frontend-interview.png' })
  coverImageUrl: string;

  @ApiProperty({ example: 42 })
  totalCards: number;

  @ApiProperty({ example: 'user-id' })
  ownerId: string;

  @ApiProperty({ example: 123 })
  views: number;

  @ApiProperty({ example: 456 })
  totalReviews: number;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-07T10:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ type: DeckOwnerDto })
  owner: DeckOwnerDto;

  @ApiProperty({ type: [DeckTagRelationDto] })
  deckTags: DeckTagRelationDto[];

  @ApiProperty({ type: [DeckTagDto] })
  tags: DeckTagDto[];

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ type: DeckPermissionsDto })
  permissions: DeckPermissionsDto;
}

export class DeckDetailDto extends DeckSummaryDto {
  @ApiProperty({ type: [DeckCardDto] })
  cards: DeckCardDto[];
}

export class PaginatedDeckDto {
  @ApiProperty({ type: [DeckSummaryDto] })
  items: DeckSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
