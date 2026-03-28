import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Abonnement } from '../abonnements/schemas/abonnement.schema';
import { Avis } from '../avis/schemas/avis.schema';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { Favori } from '../favoris/schemas/favori.schema';
import { Paiement } from '../paiements/schemas/paiement.schema';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { Role } from '../roles/schemas/role.schema';
import { ROLE_NAMES } from '../roles/seeds/roles.seed';
import { RolesService } from '../roles/roles.service';
import { Admin } from '../admins/schemas/admin.schema';
import { Prestataire } from '../prestataires/schemas/prestataire.schema';
import { Voyageur } from '../voyageurs/schemas/voyageur.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { User } from './schemas/user.schema';
import type { AdminUserDetailResponse, SafeUserResponse } from './utils/safe-user.types';
import { toSafeUserResponse } from './utils/safe-user.mapper';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Voyageur.name) private readonly voyageurModel: Model<Voyageur>,
    @InjectModel(Prestataire.name) private readonly prestataireModel: Model<Prestataire>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
    @InjectModel(Favori.name) private readonly favoriModel: Model<Favori>,
    @InjectModel(Avis.name) private readonly avisModel: Model<Avis>,
    @InjectModel(Abonnement.name) private readonly abonnementModel: Model<Abonnement>,
    @InjectModel(Paiement.name) private readonly paiementModel: Model<Paiement>,
    private readonly rolesService: RolesService,
  ) {}

  private assertValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant utilisateur invalide');
    }
  }

  async findAllPaginated(query?: PaginationQueryDto): Promise<{
    data: SafeUserResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query?.page != null && query.page > 0 ? query.page : 1;
    const limit = Math.min(
      query?.limit != null && query.limit > 0 ? query.limit : 20,
      100,
    );
    const skip = (page - 1) * limit;

    const [raw, total] = await Promise.all([
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('role')
        .select('-password -refreshTokenHash')
        .lean()
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    const data = raw.map((u) =>
      toSafeUserResponse(u as unknown as Record<string, unknown>),
    );
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<AdminUserDetailResponse> {
    this.assertValidObjectId(id);
    const user = await this.userModel
      .findById(id)
      .populate('role')
      .select('-password -refreshTokenHash')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const safe = toSafeUserResponse(user as unknown as Record<string, unknown>);
    const roleName = this.getRoleNameFromUser(user);
    const profile = await this.loadProfileForUser(id, roleName);

    return { ...safe, profile };
  }

  private getRoleNameFromUser(user: {
    role?: unknown;
  }): string | null {
    const r = user.role;
    if (r && typeof r === 'object' && r !== null && 'name' in r) {
      return String((r as { name: string }).name);
    }
    return null;
  }

  private async loadProfileForUser(
    userId: string,
    roleName: string | null,
  ): Promise<AdminUserDetailResponse['profile']> {
    const uid = new Types.ObjectId(userId);
    if (roleName === ROLE_NAMES.CLIENT) {
      const v = await this.voyageurModel.findOne({ user: uid }).lean().exec();
      if (!v) return null;
      return {
        type: 'client',
        preferences: v.preferences,
      };
    }
    if (roleName === ROLE_NAMES.PRESTATAIRE) {
      const p = await this.prestataireModel.findOne({ user: uid }).lean().exec();
      if (!p) return null;
      return {
        type: 'prestataire',
        raisonSociale: p.raisonSociale,
        siret: p.siret,
      };
    }
    if (roleName === ROLE_NAMES.ADMIN) {
      const a = await this.adminModel.findOne({ user: uid }).lean().exec();
      if (!a) return null;
      return {
        type: 'admin',
        notes: a.notes,
      };
    }
    return null;
  }

  /**
   * Alignement des documents voyageur / prestataire / admin avec le rôle actuel.
   * Un seul profil « étendu » existe à la fois (selon le rôle).
   */
  private async syncProfileForRole(
    userId: Types.ObjectId,
    roleName: string,
  ): Promise<void> {
    await this.voyageurModel.deleteMany({ user: userId }).exec();
    await this.prestataireModel.deleteMany({ user: userId }).exec();
    await this.adminModel.deleteMany({ user: userId }).exec();

    if (roleName === ROLE_NAMES.CLIENT) {
      await this.voyageurModel.create({ user: userId });
    } else if (roleName === ROLE_NAMES.PRESTATAIRE) {
      await this.prestataireModel.create({ user: userId });
    } else if (roleName === ROLE_NAMES.ADMIN) {
      await this.adminModel.create({ user: userId });
    }
  }

  async create(dto: AdminCreateUserDto): Promise<AdminUserDetailResponse> {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.userModel.exists({ email });
    if (exists) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    const roleId = await this.rolesService.getRoleIdByName(dto.role);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const created = await this.userModel.create({
      nom: dto.nom.trim(),
      prenom: dto.prenom.trim(),
      email,
      password: hashedPassword,
      telephone: dto.telephone?.trim() || undefined,
      adresse: dto.adresse?.trim() || undefined,
      isActive: dto.isActive ?? true,
      role: roleId,
    });

    const uid = created._id as Types.ObjectId;
    await this.syncProfileForRole(uid, dto.role);

    return this.findOne(String(created._id));
  }

  async update(
    id: string,
    dto: AdminUpdateUserDto,
  ): Promise<AdminUserDetailResponse> {
    this.assertValidObjectId(id);
    const existing = await this.userModel
      .findById(id)
      .populate('role')
      .lean()
      .exec();
    if (!existing) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const currentRoleName = this.getRoleNameFromUser(
      existing as { role?: unknown },
    );
    if (!currentRoleName) {
      throw new BadRequestException('Rôle utilisateur invalide');
    }

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      const taken = await this.userModel.exists({
        email,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (taken) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    let newRoleName = currentRoleName;
    if (dto.role !== undefined && dto.role !== currentRoleName) {
      await this.assertCanChangeRoleAwayFromAdmin(id, currentRoleName, dto.role);
      newRoleName = dto.role;
    }

    const set: Record<string, unknown> = {};

    if (dto.nom !== undefined) set.nom = dto.nom.trim();
    if (dto.prenom !== undefined) set.prenom = dto.prenom.trim();
    if (dto.email !== undefined) set.email = dto.email.toLowerCase().trim();
    if (dto.telephone !== undefined) {
      set.telephone = dto.telephone?.trim() || undefined;
    }
    if (dto.adresse !== undefined) {
      set.adresse = dto.adresse?.trim() || undefined;
    }
    if (dto.role !== undefined) {
      set.role = await this.rolesService.getRoleIdByName(dto.role);
    }

    if (dto.password !== undefined) {
      set.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(set).length === 0) {
      return this.findOne(id);
    }

    const mongoUpdate: Record<string, unknown> = { $set: set };
    if (dto.password !== undefined) {
      mongoUpdate.$unset = { refreshTokenHash: 1 };
    }

    await this.userModel.findByIdAndUpdate(id, mongoUpdate).exec();

    if (dto.role !== undefined && newRoleName !== currentRoleName) {
      await this.syncProfileForRole(new Types.ObjectId(id), newRoleName);
    }

    return this.findOne(id);
  }

  /**
   * Interdit de retirer le rôle admin au dernier administrateur en base.
   */
  private async assertCanChangeRoleAwayFromAdmin(
    userId: string,
    currentRoleName: string,
    nextRoleName: string,
  ): Promise<void> {
    if (currentRoleName !== ROLE_NAMES.ADMIN || nextRoleName === ROLE_NAMES.ADMIN) {
      return;
    }
    const adminRoleId = await this.rolesService.getRoleIdByName(ROLE_NAMES.ADMIN);
    const adminCount = await this.userModel.countDocuments({
      role: adminRoleId,
    });
    if (adminCount <= 1) {
      throw new ConflictException(
        'Impossible de modifier le rôle : vous êtes le dernier administrateur.',
      );
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    actorUserId: string,
  ): Promise<AdminUserDetailResponse> {
    this.assertValidObjectId(id);
    if (id === actorUserId && dto.isActive === false) {
      throw new ForbiddenException(
        'Vous ne pouvez pas désactiver votre propre compte administrateur.',
      );
    }

    const user = await this.userModel.findById(id).populate('role').lean().exec();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const roleName = this.getRoleNameFromUser(user as { role?: unknown });
    const cibleActive = (user as { isActive?: boolean }).isActive === true;
    if (
      roleName === ROLE_NAMES.ADMIN &&
      dto.isActive === false &&
      cibleActive &&
      (await this.countActiveAdmins()) <= 1
    ) {
      throw new ConflictException(
        'Impossible de désactiver le dernier administrateur actif.',
      );
    }

    await this.userModel
      .findByIdAndUpdate(id, { $set: { isActive: dto.isActive } })
      .exec();

    return this.findOne(id);
  }

  private async countAdmins(): Promise<number> {
    const adminRoleId = await this.rolesService.getRoleIdByName(ROLE_NAMES.ADMIN);
    return this.userModel.countDocuments({ role: adminRoleId }).exec();
  }

  /** Administrateurs encore actifs (connexion autorisée). */
  private async countActiveAdmins(): Promise<number> {
    const adminRoleId = await this.rolesService.getRoleIdByName(ROLE_NAMES.ADMIN);
    return this.userModel
      .countDocuments({ role: adminRoleId, isActive: true })
      .exec();
  }

  /**
   * Suppression définitive uniquement si aucune donnée métier ne référence cet utilisateur.
   * Sinon utilisez PATCH …/status avec `isActive: false` (désactivation).
   */
  async remove(id: string, actorUserId: string): Promise<void> {
    this.assertValidObjectId(id);
    if (id === actorUserId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte.');
    }

    const user = await this.userModel.findById(id).populate('role').lean().exec();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const roleName = this.getRoleNameFromUser(user as { role?: unknown });
    if (roleName === ROLE_NAMES.ADMIN && (await this.countAdmins()) <= 1) {
      throw new ConflictException(
        'Impossible de supprimer le dernier administrateur.',
      );
    }

    const uid = new Types.ObjectId(id);
    const blockers = await this.gatherDeleteBlockers(uid);
    if (blockers.length > 0) {
      throw new ConflictException(
        `Suppression impossible : données liées — ${blockers.join(
          ' ; ',
        )}. Utilisez la désactivation (PATCH /users/:id/status) plutôt qu'une suppression.`,
      );
    }

    await this.voyageurModel.deleteMany({ user: uid }).exec();
    await this.prestataireModel.deleteMany({ user: uid }).exec();
    await this.adminModel.deleteMany({ user: uid }).exec();
    await this.userModel.findByIdAndDelete(id).exec();
  }

  private async gatherDeleteBlockers(userId: Types.ObjectId): Promise<string[]> {
    const reasons: string[] = [];
    const add = async (
      label: string,
      countPromise: Promise<number>,
    ): Promise<void> => {
      const n = await countPromise;
      if (n > 0) reasons.push(`${label} (${n})`);
    };

    await add(
      'établissements',
      this.etablissementModel.countDocuments({ prestataire: userId }).exec(),
    );
    await add(
      'réservations (client)',
      this.reservationModel.countDocuments({ voyageur: userId }).exec(),
    );
    await add(
      'réservations (prestataire)',
      this.reservationModel.countDocuments({ prestataire: userId }).exec(),
    );
    await add(
      'favoris',
      this.favoriModel.countDocuments({ voyageur: userId }).exec(),
    );
    await add('avis', this.avisModel.countDocuments({ voyageur: userId }).exec());
    await add(
      'abonnements',
      this.abonnementModel.countDocuments({ user: userId }).exec(),
    );
    await add(
      'paiements',
      this.paiementModel.countDocuments({ voyageur: userId }).exec(),
    );

    return reasons;
  }
}
