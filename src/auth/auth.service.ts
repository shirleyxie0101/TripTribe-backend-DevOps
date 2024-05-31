import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import dayjs, { unix } from 'dayjs';
import _ from 'lodash';
import { Model } from 'mongoose';

import { QUEUE_PROCESS_REGISTER } from '@/common/constant/queue.constant';
import { UserIdDto } from '@/user/dto/userId.dto';
import { UserDocument, User } from '@/user/schema/user.schema';
import { UserService } from '@/user/user.service';

import { AuthRegisterDto } from './dto/auth-register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationEmailDto } from './dto/send-verification-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private readonly userService: UserService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectQueue('send-email') private sendEmailQueue: Queue
  ) {}

  async register(registerData: AuthRegisterDto, hostname) {
    const user = await this.userService.create(registerData);
    const userId = user._id;
    // queue task: send validation email when user register successfull
    await this.sendEmailQueue.add(
      QUEUE_PROCESS_REGISTER,
      {
        userId,
        hostname,
      },
      { delay: 100 }
    );
    return user;
  }

  async login(user: UserDocument) {
    const userId = String(user._id);
    const emailToken = user.emailToken;
    if (emailToken) {
      return { message: 'Unverified' };
    }
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);
    return {
      message: 'login success',
      accessToken,
      refreshToken,
    };
  }

  //generate accessToken
  async generateAccessToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('auth.accessTokenExpiresIn'),
    });
  }

  //generate refreshToken
  async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('auth.refreshTokenExpiresIn'),
    });
  }

  //use refreshToken to get a new accessToken
  async refreshToken(refreshToken: string) {
    //verify refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token miss');
    }

    // must Assertion sub and exp exist in decodedToken object
    const decodedToken: { sub: string; exp: number } | null = this.jwtService.decode(
      refreshToken
    ) as {
      sub: string;
      exp: number;
    } | null;

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    // using dayjs, if refresh_token expired, return 'Refresh Token is expired'
    // get expireTime
    const expirationTime = unix(decodedToken.exp);
    // get currentTime
    const currentTime = dayjs();
    // dayjs isBefore API to compare
    if (expirationTime.isBefore(currentTime)) {
      throw new UnauthorizedException('Refresh Token is expired');
    }

    // find userId from 'sub', then find user
    const userId = decodedToken.sub;
    const foundUser = await this.userService.findOne(userId);
    //if user not exist ,throw an  unauthorizedException with message 'fake Token'
    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    //if user exist and refresh token not expired, generate a new accessToken and return
    const accessToken = await this.generateAccessToken(String(userId));
    return { accessToken: accessToken };
  }

  async resetPassword(userId: UserIdDto['_id'], newPassword: ResetPasswordDto) {
    const userIdToString = String(userId);
    const user = await this.userService.findOne(userIdToString);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const editedUser = await this.userService.updatePassword(userId, newPassword);
    return editedUser;
  }

  async verifyEmail(token) {
    const decodedData = await this.decodeEmailToken(token);
    const email = decodedData.email;
    const user = await this.userModel.findOne({ email }).exec();
    if (decodedData.issuedAt === undefined || decodedData.expireTime === undefined) {
      throw new Error('Invalid token data');
    }
    const expireTime = decodedData.expireTime;
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
    const databaseToken = user?.emailToken;

    if (!user) {
      return { message: 'User not found' };
    }

    if (!user.emailToken) {
      return { message: 'Email token not found' };
    }

    if (token != databaseToken) {
      return { message: 'illegal token' };
    }

    if (currentTimestampInSeconds > expireTime) {
      return { message: 'expired token' };
    } else {
      await this.deleteEmailToken(user._id);
      return { message: 'Validated' };
    }
  }

  async deleteEmailToken(userId: UserIdDto['_id']): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $unset: { emailToken: 1 } }).exec();
  }

  async decodeEmailToken(token: string) {
    const decodedToken: { sub: string; exp: number; iat: number } | null = this.jwtService.decode(
      token
    ) as {
      sub: string;
      exp: number;
      iat: number;
    } | null;
    const email = decodedToken?.sub as string;
    const issuedAt = decodedToken?.iat;
    const expireTime = decodedToken?.exp;
    return { email, issuedAt, expireTime };
  }

  async refreshEmailToken(token: string, hostname): Promise<string> {
    const decodedata = await this.decodeEmailToken(token);
    console.log('decodedata', decodedata);
    const email = decodedata.email;
    console.log('ResendEmail', email);

    // const payload = { sub: email, iat: Math.floor(Date.now() / 1000) };
    // const EMAIL_TOKEN_TIME = configuration().auth.emailTokenExpiration;
    // const newEmailToken = await this.jwtService.signAsync(payload, { expiresIn: EMAIL_TOKEN_TIME });
    const newEmailToken = await this.userService.generateEmailAccessToken(email);

    const user = await this.userModel
      .findOneAndUpdate({ email }, { emailToken: newEmailToken }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // const userId = await this.userModel.findOne({ email }).exec();

    await this.sendEmailQueue.add(
      QUEUE_PROCESS_REGISTER,
      {
        userId: user,
        hostname,
      },
      { delay: 100 }
    );
    return newEmailToken;
  }

  /**
   * @summary send email based on email
   * @param email
   * @param hostname
   */
  async resendEmail(
    email: SendVerificationEmailDto['email'],
    hostname: SendVerificationEmailDto['token']
  ) {
    const user = await this.userModel.findOne({ email }).exec();
    if (_.isNil(user)) return;
    if (_.isUndefined(user?.emailToken)) return;

    const newEmailToken = await this.userService.generateEmailAccessToken(email);
    // const payload = { sub: email, iat: Math.floor(Date.now() / 1000) };
    // const EMAIL_TOKEN_TIME = '7d';
    // const newEmailToken = await this.jwtService.signAsync(payload, { expiresIn: EMAIL_TOKEN_TIME });
    const updateUser = await this.userModel
      .findOneAndUpdate({ email }, { emailToken: newEmailToken }, { new: true })
      .exec();

    await this.sendEmailQueue.add(
      QUEUE_PROCESS_REGISTER,
      {
        userId: updateUser,
        hostname,
      },
      { delay: 100 }
    );
  }
}
