import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(email: string, password: string): Promise<AuthResponseDto> {
    try {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new ConflictException('User with this email already exists');
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashed,
        },
      });

      const token = this.signToken(user.id, user.email);

      return { access_token: token };
    } catch (error) {
      throw error;
    }
  }

  async signin(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = user && (await bcrypt.compare(password, user.password));

    if (!valid) {
      throw new UnauthorizedException('Wrong password');
    }

    const token = this.signToken(user.id, user.email);

    return { access_token: token };
  }

  private signToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwt.sign(payload);
  }
}
