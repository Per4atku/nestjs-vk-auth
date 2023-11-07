import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, VkStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenStrategy } from './strategy/refresth.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, VkStrategy, JwtStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
