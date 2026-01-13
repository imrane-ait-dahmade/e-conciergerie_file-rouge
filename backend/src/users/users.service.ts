import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login_user.dto';
import { User } from './schemas/user.schema';
import type { ProfileResponseDto } from './dto/profile-response.dto';
import { toSafeUserResponse } from './utils/safe-user.mapper';
import type { SafeUserResponse } from './utils/safe-user.types';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Fetches the full user profile by ID, excluding sensitive fields.
   * Sensitive fields (password, tokens) have select: false in schema.
   */
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userModel
      .findById(userId)
      .select('-password -refreshTokenHash')
      .lean();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return toSafeUserResponse(user as unknown as Record<string, unknown>);
  }

  /**
   * Creates a user (admin/internal use). Never accepts role, isActive, authProvider from client.
   * Returns safe user response (no password, tokens).
   */
  async CreateUser(createUserDto: CreateUserDto): Promise<SafeUserResponse> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userData = {
      nom: createUserDto.nom.trim(),
      prenom: createUserDto.prenom.trim(),
      email: createUserDto.email.toLowerCase().trim(),
      password: hashedPassword,
      telephone: createUserDto.telephone?.trim() || undefined,
      adresse: createUserDto.adresse?.trim() || undefined,
      isActive: true,
    };
    const newUser = await this.userModel.create(userData);
    return toSafeUserResponse(newUser as unknown as Record<string, unknown>);
  }
  /**
   * Legacy login. Prefer POST /auth/login for full token flow (access + refresh).
   */
  async Login(loginDto: LoginUserDto): Promise<{ access_token: string }> {
    const normalizedEmail = loginDto.email.toLowerCase().trim();
    const user = await this.userModel
      .findOne({ email: normalizedEmail })
      .select('+password')
      .lean();

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Ce compte a été désactivé');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = { email: user.email, sub: String(user._id), type: 'access' as const };
    return {
      access_token: this.jwtService.sign(payload),
    };
  } 
}
