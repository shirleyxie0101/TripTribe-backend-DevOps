import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { compareSync } from 'bcryptjs';
import { validate } from 'class-validator';
import { Model } from 'mongoose';
import { IStrategyOptionsWithRequest, Strategy } from 'passport-local';

import { User } from '@/user/schema/user.schema';

import { AuthLoginDto } from './dto/auth-login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super({ usernameField: 'email', passwordField: 'password' } as IStrategyOptionsWithRequest);
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const authLoginDto = new AuthLoginDto();
      authLoginDto.email = email;
      authLoginDto.password = password;

      // Validate the input using DTO
      const errors = await validate(authLoginDto);
      if (errors.length > 0) {
        throw new UnauthorizedException(`Invalid credentials ${errors}`);
      }

      const user = await this.userModel.findOne({ email: authLoginDto.email }).select('+password');

      if (!user) {
        throw new UnauthorizedException('no user found');
      }

      // bcrypt compare password
      if (!compareSync(password, user.password)) {
        throw new UnauthorizedException('password not correct');
      }

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
