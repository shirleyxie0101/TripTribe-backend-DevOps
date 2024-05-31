import { BullBoardInstance, InjectBullBoard } from '@bull-board/nestjs';
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { AuthService } from './auth.service';
import { CurrentUser } from './CurrentUser.decorator';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendVerificationEmailDto } from './dto/send-verification-email.dto';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectBullBoard() private readonly boardInstance: BullBoardInstance
  ) {}

  @ApiOperation({
    summary: 'Register',
    description: 'Register an user account successfully',
  })
  @ApiBody({
    description: 'User account to register',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', example: 'do222@om141ai5l1.com' },
        password: { type: 'string', example: 'Abc12345+' },
        firstName: { type: 'string', example: 'David' },
        lastName: { type: 'string', example: 'Beckham' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Register an user account successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @Post('register')
  register(@Body() authRegisterDto: AuthRegisterDto, @Req() req) {
    const hostname = req.hostname;
    const registerData = plainToClass(AuthRegisterDto, authRegisterDto);
    return this.authService.register(registerData, hostname);
  }

  @ApiOperation({
    summary: 'Login',
    description: 'Login an user account successfully',
  })
  @ApiBody({
    description: 'User account to login',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'triptribeuser@triptribe.com' },
        password: { type: 'string', example: 'Abc123456+' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Login an user account successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Refresh Token successfully',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Token to refresh',
  })
  @ApiResponse({ status: 201, description: 'Refresh Token successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('refreshToken')
  refreshToken(@Body() params: RefreshTokenDto) {
    return this.authService.refreshToken(params.refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Reset Password successfully',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'New Password to reset',
  })
  @ApiResponse({ status: 201, description: 'Reset Password successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(@CurrentUser() currentUser, @Body() newPassword: ResetPasswordDto) {
    const userId = currentUser._id;
    return await this.authService.resetPassword(userId, newPassword);
  }

  @ApiOperation({
    summary: 'Email validation',
    description: 'User email validate successfully',
  })
  @ApiBody({
    description: 'User email to validate',
    schema: {
      type: 'object',
      required: ['email', 'token', 'createdUserId'],
      properties: {
        email: { type: 'string', example: 'triptribeuser@triptribe.com' },
        token: { type: 'string' },
        createdUserId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User email validate successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('verify')
  async verifyUserEmail(@Body('token') token: SendVerificationEmailDto['token']) {
    const isEmailVerified = await this.authService.verifyEmail(token);
    return isEmailVerified;
  }

  @ApiOperation({
    summary: 'Refresh Email Token',
    description: 'Refresh Email Token in database',
  })
  @ApiBody({
    description: 'Refresh Email Token',
    schema: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Check user email validate status successfully' })
  @Post('resend-email')
  async refreshUserEmailToken(@Body('token') token: SendVerificationEmailDto['token'], @Req() req) {
    const hostname = req.hostname;
    return await this.authService.refreshEmailToken(token, hostname);
  }

  @ApiOperation({
    summary: 'Refresh use user Email',
    description: 'Refresh Email Token in database',
  })
  @ApiBody({
    description: 'Resend email by input email',
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Check user email validate status successfully' })
  @Post('resend')
  async resendEmail(@Body('email') email: SendVerificationEmailDto['email'], @Req() req) {
    const hostname = req.hostname;
    return await this.authService.resendEmail(email, hostname);
  }
}
