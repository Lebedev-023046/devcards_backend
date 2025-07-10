import { IsString, IsBoolean } from 'class-validator';

export class CreateOptionDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}
