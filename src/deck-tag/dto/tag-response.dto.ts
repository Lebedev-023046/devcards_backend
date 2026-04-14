import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class TagResponseDto {
  @ApiProperty({ example: 'tag-id' })
  id: string;

  @ApiProperty({ example: 'React' })
  name: string;
}

export class PaginatedTagsDto {
  @ApiProperty({ type: [TagResponseDto] })
  items: TagResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
