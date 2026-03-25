import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';
import { RolesService } from '../roles/roles.service';
import { seedInitialAdmin } from './seeds/admin.seed';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login_user.dto';
import { User } from './schemas/user.schema';
import type { ProfileResponseDto } from './dto/profile-response.dto';
import { toSafeUserResponse } from './utils/safe-user.mapper';
import type { SafeUserResponse } from './utils/safe-user.types';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    private readonly config: ConfigService,
  ) {}

  // Au démarrage : comme un seeder Laravel lancé depuis AppServiceProvider::boot().
  async onModuleInit(): Promise<void> {
    await this.createInitialAdmin();
  }

  /**
   * Fetches the full user profile by ID, excluding sensitive fields.
   * Sensitive fields (password, tokens) have select: false in schema.
   */
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userModel
      .findById(userId)
      .populate('role')
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
    const roleId = await this.rolesService.getClientRoleId();
    const userData = {
      nom: createUserDto.nom.trim(),
      prenom: createUserDto.prenom.trim(),
      email: createUserDto.email.toLowerCase().trim(),
      password: hashedPassword,
      telephone: createUserDto.telephone?.trim() || undefined,
      adresse: createUserDto.adresse?.trim() || undefined,
      isActive: true,
      role: roleId,
    };
    const created = await this.userModel.create(userData);
    const newUser = await this.userModel
      .findById(created._id)
      .populate('role')
      .lean();
    return toSafeUserResponse(newUser as unknown as Record<string, unknown>);
  }

  /**
   * Lit le .env (ADMIN_*) et délègue au fichier seed — comme appeler un Seeder depuis le service provider.
   */
  async createInitialAdmin(): Promise<void> {
    await seedInitialAdmin(
      this.userModel,
      this.roleModel,
      {
        email: this.config.get<string>('adminSeed.email') ?? '',
        password: this.config.get<string>('adminSeed.password') ?? '',
        nom: this.config.get<string>('adminSeed.nom') ?? 'Admin',
        prenom: this.config.get<string>('adminSeed.prenom') ?? 'Système',
      },
      this.logger,
    );
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
