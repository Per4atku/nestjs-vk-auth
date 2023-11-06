import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import { Strategy, VerifyCallback } from 'passport-vkontakte';

config();

@Injectable()
export class VkStrategy extends PassportStrategy(Strategy, 'vk') {
  constructor() {
    super(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3333/auth/vk/callback',
        lang: 'ru',
      },
      async function validate(
        accessToken: string,
        refreshToken: string,
        params: string,
        profile: any,
        done: VerifyCallback,
      ) {
        if (!profile) {
          return done(new UnauthorizedException(), false);
        }
        const user = {
          vkId: String(profile.id),
          username: profile.username,
          displayName: profile.displayName,
          profileURL: profile.profileUrl,
          profilePhoto: profile.photos[0].value,
        };

        return done(null, user);
      },
    );
  }
}
