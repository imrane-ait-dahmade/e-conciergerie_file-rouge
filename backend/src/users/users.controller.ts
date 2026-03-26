import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login_user.dto';
import type { ProfileResponseDto } from './dto/profile-response.dto';
import type { SafeUserResponse } from './utils/safe-user.types';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { getSchemaPath } from '@nestjs/swagger';
import { ProfileResponseSchema } from './dto/profile-response-schema';

@ApiTags('Users')
@ApiExtraModels(ProfileResponseSchema)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async CreateUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SafeUserResponse> {
    return this.usersService.CreateUser(createUserDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async Login(
    @Body() loginDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    return this.usersService.Login(loginDto);
  }

  /**
   * Profil : route protégée par JWT.
   * req.user est rempli par JwtStrategy après validation du token.
   * Laravel : Auth::user() ou $request->user()
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil utilisateur' })
  @ApiResponse({
    status: 200,
    schema: { $ref: getSchemaPath(ProfileResponseSchema) },
  })
  @ApiResponse({ status: 401, description: 'Token manquant ou invalide' })
  async getProfile(
    @Req() req: { user: RequestUser },
  ): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(req.user.userId);
  }
}
