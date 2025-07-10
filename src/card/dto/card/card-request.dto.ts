import { ApiProperty } from '@nestjs/swagger';

export class CardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  deckId: string;
}
