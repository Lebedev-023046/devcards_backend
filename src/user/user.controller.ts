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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    operationId: 'getUser',
  })
  @ApiQuery({ name: 'id', required: true, type: String, example: '1' })
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, createdAt, updatedAt, ...userInfo } = user;

    return userInfo;
  }
}
