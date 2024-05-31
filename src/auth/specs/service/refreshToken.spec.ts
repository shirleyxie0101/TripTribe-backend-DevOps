import { getQueueToken } from '@nestjs/bull';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';

import { AuthService } from '@/auth/auth.service';
import { User } from '@/user/schema/user.schema';
import { UserService } from '@/user/user.service';

jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs');
  const mockDayjs = (...args) => {
    const instance = actualDayjs(...args);
    instance.unix = jest.fn();
    instance.isBefore = jest.fn();
    return instance;
  };
  Object.assign(mockDayjs, actualDayjs);
  return mockDayjs;
});

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        {
          provide: getQueueToken('send-email'),
          useValue: {},
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  describe('refreshToken', () => {
    it('should throw an UnauthorizedException if no refreshToken is provided', async () => {
      await expect(authService.refreshToken('')).rejects.toThrow(
        new UnauthorizedException('Refresh token miss')
      );
    });

    it('should throw an UnauthorizedException if refreshToken is invalid', async () => {
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);
      await expect(authService.refreshToken('invalidToken')).rejects.toThrow(
        new UnauthorizedException('Invalid Refresh Token')
      );
    });

    it('should throw an UnauthorizedException if refreshToken is expired', async () => {
      const decodedToken = { sub: '123', exp: 1000000000 };
      jest.spyOn(jwtService, 'decode').mockReturnValue(decodedToken);

      // mock refresh token expired
      jest.spyOn(dayjs, 'unix').mockReturnValue({ isBefore: () => true } as dayjs.Dayjs);

      await expect(authService.refreshToken('expiredToken')).rejects.toThrow(
        new UnauthorizedException('Refresh Token is expired')
      );
    });

    it('should throw an UnauthorizedException if user does not exist', async () => {
      const decodedToken = { sub: '123', exp: 1000000000 };
      jest.spyOn(jwtService, 'decode').mockReturnValue(decodedToken);

      // mock refresh token valid
      jest.spyOn(dayjs, 'unix').mockReturnValue({ isBefore: () => false } as dayjs.Dayjs);

      // mock no user found
      jest.spyOn(userService, 'findOne').mockResolvedValue(null as any);

      await expect(authService.refreshToken('validToken')).rejects.toThrow(
        new UnauthorizedException('User not found')
      );
    });

    it('should return a new accessToken if refreshToken is valid and user exists', async () => {
      const decodedToken = { sub: '123', exp: 1000000000 };
      jest.spyOn(jwtService, 'decode').mockReturnValue(decodedToken);

      // mock refresh token valid
      jest.spyOn(dayjs, 'unix').mockReturnValue({ isBefore: () => false } as dayjs.Dayjs);

      // mock user was found
      const user = {} as User;
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);

      // mock get newAccessToken
      const newAccessToken = 'newAccessToken';
      jest.spyOn(authService, 'generateAccessToken').mockResolvedValue(newAccessToken);

      const result = await authService.refreshToken('validToken');
      expect(result).toEqual({ accessToken: newAccessToken });
    });
  });
});
