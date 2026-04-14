import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({
    example: 'user-id',
    description: 'Unique user identifier',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Display name of the user',
  })
  name: string;

  @ApiProperty({
    example: 25,
    description: 'Age of the user in full years',
  })
  age: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'User role',
  })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token for authenticated user',
  })
  token: string;

  @ApiProperty({
    type: AuthUserDto,
    description: 'Authenticated user profile',
  })
  user: AuthUserDto;
}
