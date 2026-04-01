import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
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
      email: user.email,
      role: user.role,
    };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    operationId: 'getCurrentUser',
  })
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
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }
}
