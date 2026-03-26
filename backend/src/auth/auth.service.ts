/**
 * Service d'authentification - Version simplifiée.
 * Gère : signup, login, refresh, logout.
 *
 * Laravel équivalent : AuthController + Guard
 */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/schemas/user.schema';
import { SignupDto } from '../users/dto/signup.dto';
import { toSafeUserResponse } from '../users/utils/safe-user.mapper';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * SIGNUP - Inscription
   * 1. Vérifier si l'email existe déjà
   * 2. Hasher le mot de passe (bcrypt)
   * 3. Sauvegarder l'utilisateur en base
   * 4. Retourner access token + refresh token + user (connexion auto)
   */
  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase().trim();

    // 1. Vérifier si l'email existe déjà
    const existe = await this.userModel.findOne({ email }).lean();
    if (existe) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    // 2. Hasher le mot de passe (bcrypt, 10 rounds)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const roleId = await this.rolesService.getClientRoleId();

    // 3. Sauvegarder l'utilisateur en base
    const created = await this.userModel.create({
      nom: dto.nom.trim(),
      prenom: dto.prenom.trim(),
      email,
      password: passwordHash,
      telephone: dto.telephone?.trim(),
      adresse: dto.adresse?.trim(),
      isActive: true,
      role: roleId,
    });

    const user = await this.userModel
      .findById(created._id)
      .populate('role')
      .lean();

    if (!user) {
      throw new UnauthorizedException('Erreur lors de la création du compte');
    }

    // 4. Retourner tokens + user (connexion automatique)
    return this.creerReponseLogin(
      user as unknown as Record<string, unknown> & {
        _id: unknown;
        email: string;
      },
    );
  }

  /**
   * LOGIN - Connexion
   * 1. Trouver l'utilisateur par email
   * 2. Comparer le mot de passe avec bcrypt
   * 3. Générer access token JWT
   * 4. Générer refresh token
   * 5. Sauvegarder le hash du refresh token en base
   * 6. Retourner tokens + user (sans données sensibles)
   */
  async login(email: string, password: string) {
    const emailNorm = email.toLowerCase().trim();

    // 1. Trouver l'utilisateur par email (+password car select: false par défaut)
    const user = await this.userModel
      .findOne({ email: emailNorm })
      .select('+password')
      .populate('role')
      .lean();

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    // 2. Comparer le mot de passe (bcrypt.compare)
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // 3-6. Générer tokens, sauvegarder refresh hash, retourner réponse
    return this.creerReponseLogin(
      user as unknown as Record<string, unknown> & {
        _id: unknown;
        email: string;
      },
    );
  }

  /**
   * Refresh : échange un refresh token valide contre une nouvelle paire de tokens.
   * Laravel : Sanctum token refresh
   */
  async refresh(refreshToken: string) {
    const secret = this.config.getOrThrow<string>('jwt.refreshSecret');
    const expiresIn = this.config.get('jwt.refreshExpiresIn') ?? '7d';

    let payload: { sub?: string; email?: string; type?: string };
    try {
      payload = jwt.verify(refreshToken, secret) as typeof payload;
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (payload?.type !== 'refresh' || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash')
      .populate('role')
      .lean();
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException(
        'Session expirée. Veuillez vous reconnecter.',
      );
    }

    // Vérifier que le refresh token correspond à celui stocké
    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) {
      throw new UnauthorizedException('Refresh token invalide ou révoqué');
    }

    // Nouvelle paire de tokens (rotation)
    return this.creerReponseLogin(
      user as unknown as Record<string, unknown> & {
        _id: unknown;
        email: string;
      },
    );
  }

  /**
   * Déconnexion : supprime le refresh token en base.
   * Le client ne pourra plus obtenir de nouveaux access tokens.
   * Laravel : Auth::logout()
   */
  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { refreshTokenHash: '' },
    });
    return { message: 'Déconnexion réussie' };
  }

  /**
   * Helper partagé (signup + login) :
   * - Génère access token (1 jour)
   * - Génère refresh token (7 jours)
   * - Sauvegarde le hash du refresh token en base
   * - Retourne { accessToken, refreshToken, user } (user sans password ni tokens)
   */
  private async creerReponseLogin(
    user: Record<string, unknown> & { _id: unknown; email: string },
  ) {
    const userId = String(user._id);
    const payload = { email: user.email, sub: userId, type: 'access' as const };

    // Générer access token (utilisé dans Authorization: Bearer)
    const accessToken = this.jwtService.sign(payload);

    // Générer refresh token (secret différent, durée plus longue)
    const refreshSecret = this.config.getOrThrow<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.config.get('jwt.refreshExpiresIn') ?? '7d';
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshExpiresIn },
    );

    // Sauvegarder le hash du refresh token en base (pour logout + refresh)
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { refreshTokenHash: refreshHash },
    });

    // Retourner user sans password ni refreshTokenHash (données sensibles)
    const userPropre = toSafeUserResponse(user as Record<string, unknown>);
    return {
      accessToken,
      refreshToken,
      user: userPropre,
    };
  }
}
