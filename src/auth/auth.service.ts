import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DevSignInDto } from './dto/dev-signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup({ name, email, password }: SignUpDto): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const userName = name?.trim() || `user${randomUUID().split('-').pop()}`;
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: userName,
        email,
        password: hashed,
      },
    });

    const token = this.signToken(user);

    return { access_token: token };
  }

  async signin({ email, password }: SignInDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = user && (await bcrypt.compare(password, user.password));

    if (!valid) {
      throw new UnauthorizedException('Wrong password');
    }

    const token = this.signToken(user);

    return { access_token: token };
  }

  async devSignin({
    email,
    name,
    role = Role.USER,
  }: DevSignInDto): Promise<AuthResponseDto> {
    const password = await bcrypt.hash(`dev-${email}`, 10);

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        name,
        role,
      },
      create: {
        email,
        name,
        role,
        password,
      },
    });

    return { access_token: this.signToken(user) };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private signToken(
    user: Pick<User, 'id' | 'email' | 'role' | 'name'>,
  ): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwt.sign(payload);
  }
}
