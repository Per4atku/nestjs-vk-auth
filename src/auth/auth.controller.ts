import { Controller, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { refreshDataDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('vk')
  @UseGuards(AuthGuard('vk'))
  async vkAuth() {
    // Этот обработчик будет автоматически перенаправлять пользователя на страницу VK для аутентификации
  }

  @Get('vk/callback')
  @UseGuards(AuthGuard('vk'))
  async vkAuthRedirect(@Req() req) {
    return this.authService.vkLogin(req);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('refresh')
  getDto(@Req() req) {
    return this.authService.refreshTokens(
      req.user['sub'],
      req.user['refreshToken'],
    );
  }
}
