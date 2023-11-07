import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { refreshDataDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async vkLogin(data) {
    console.log('Creating...');
    const tokens = this.getTokens(data.user.vkId, data.user.username);
    try {
      const user = await this.prisma.user.create({
        data: {
          vkId: data.user.vkId,
          username: data.user.username,
          displayName: data.user.displayName,
          profileURL: data.user.profileURL,
          profilePhoto: data.user.profilePhoto,
          /* refreshToken: await argon2.hash((await tokens).refreshToken), */
          refreshToken: '',
        },
      });
      this.updateRefreshToken(data.user.vkId, (await tokens).refreshToken);
      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.log("User already exists, didn't create new ");
          this.updateRefreshToken(data.user.vkId, (await tokens).refreshToken);
          return tokens;
        }
      }
      throw error;
    }
  }
  async updateRefreshToken(vkId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: { vkId: vkId },
      data: { refreshToken: await argon2.hash(refreshToken) },
    });
  }
  async getTokens(vkId: string, username: string) {
    const payload = { sub: vkId, username };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '20s',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '20d',
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
  async refreshTokens(id: string, token: string) {
    const user = this.prisma.user.findUnique({ where: { vkId: id } });

    if (!user || !(await user).refreshToken) {
      throw new ForbiddenException('Acces denied');
    }
    const tokensMatch = argon2.verify((await user).refreshToken, token);
    if (!tokensMatch) throw new ForbiddenException("Tokens doesn't match");
    const tokens = await this.getTokens(
      (await user).vkId,
      (await user).username,
    );
    this.updateRefreshToken((await user).vkId, tokens.refreshToken);
    return tokens;
  }
}
