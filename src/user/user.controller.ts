import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { UserService } from './user.service';

class UserProfileDto {
  @ApiProperty({ example: 'user-id' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 25 })
  age: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN'] })
  role: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@ApiOkResponse({ type: UserProfileDto })
@ApiNotFoundResponse({ type: ErrorResponseDto, description: 'User not found' })
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private sanitizeUser(
    user: NonNullable<Awaited<ReturnType<UserService['getUser']>>>,
  ) {
    return {
      id: user.id,
      name: user.name,
      age: user.age,
      email: user.email,
      role: user.role,
    };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    operationId: 'getCurrentUser',
  })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getCurrentUser(@CurrentUser('id') userId: string) {
    const user = await this.userService.getUser(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    operationId: 'getUser',
  })
  @ApiParam({ name: 'id', required: true, type: String, example: '1' })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }
}
