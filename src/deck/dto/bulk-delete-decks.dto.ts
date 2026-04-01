import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class BulkDeleteDecksDto {
  @ApiProperty({ type: [String], example: ['deck-1', 'deck-2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];
}
