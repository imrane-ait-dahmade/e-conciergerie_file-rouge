import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';
import { RolesService } from '../roles/roles.service';
import { seedDemoUsers } from './seeds/demo-users.seed';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login_user.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
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
  ) {}

  /** Au démarrage : 3 comptes de démo idempotents — voir `seeds/demo-users.seed.ts`. */
  async onModuleInit(): Promise<void> {
    await seedDemoUsers(this.userModel, this.roleModel, this.logger);
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
   * Met à jour le profil de l’utilisateur connecté (hors mot de passe).
   */
  async updateOwnProfile(
    userId: string,
    dto: UpdateOwnProfileDto,
  ): Promise<ProfileResponseDto> {
    const update: Record<string, unknown> = {};
    if (dto.nom !== undefined) update.nom = dto.nom.trim();
    if (dto.prenom !== undefined) update.prenom = dto.prenom.trim();
    if (dto.email !== undefined) {
      const normalized = dto.email.toLowerCase().trim();
      const taken = await this.userModel.exists({
        email: normalized,
        _id: { $ne: new Types.ObjectId(userId) },
      });
      if (taken) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      update.email = normalized;
    }
    if (dto.telephone !== undefined) {
      update.telephone = dto.telephone.trim() || undefined;
    }
    if (dto.adresse !== undefined) {
      update.adresse = dto.adresse.trim() || undefined;
    }

    if (Object.keys(update).length === 0) {
      return this.getProfile(userId);
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
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

    const payload = {
      email: user.email,
      sub: String(user._id),
      type: 'access' as const,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
