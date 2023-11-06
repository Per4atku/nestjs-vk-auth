import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async vkLogin(data) {
    console.log('Creating...');
    try {
      const user = await this.prisma.user.create({
        data: {
          vkId: data.user.vkId,
          username: data.user.username,
          displayName: data.user.displayName,
          profileURL: data.user.profileURL,
          profilePhoto: data.user.profilePhoto,
        },
      });

      return this.getToken(user.vkId, user.username);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.log("User already exists, didn't create new ");
          return this.getToken(data.user.id, data.user.email);
        }
      }
      throw error;
    }
  }
  async getToken(
    vkId: string,
    username: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: vkId, username };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return { access_token: token };
  }
}
