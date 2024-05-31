import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { strategyOptions, Strategy, ExtractJwt } from 'passport-jwt';

import { UserService } from '@/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: true, // Configure strategy to ignore token expiration (handled manually below)
    } as strategyOptions);
  }

  async validate(payload): Promise<any> {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    // Extract user ID from JWT payload and find the user in the database
    const userId = String(payload.sub);
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token or no user found.');
    }

    // Manual check for token expiration
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (payload.exp < currentTime) {
      throw new UnauthorizedException('Token expired');
    }

    return user;
  }
}
