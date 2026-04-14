import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CredentialsDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: true,
    format: 'email',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: 'User password (min. 8 characters)',
    required: true,
    minLength: 8,
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class SignInDto extends CredentialsDto {}

export class SignUpDto extends CredentialsDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Display name of the user (min. 4 characters)',
    required: true,
    minLength: 4,
  })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(4, { message: 'Name must be at least 4 characters long' })
  name: string;

  @ApiProperty({
    example: 25,
    description: 'Age of the user in full years',
    required: true,
    minimum: 1,
    maximum: 120,
  })
  @IsInt({ message: 'Age must be an integer number' })
  @Min(1, { message: 'Age must be at least 1' })
  @Max(120, { message: 'Age must be at most 120' })
  age: number;
}
