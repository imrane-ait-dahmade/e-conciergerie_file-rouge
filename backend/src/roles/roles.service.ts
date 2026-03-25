import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './schemas/role.schema';
import { ROLE_NAMES, seedRoles } from './seeds/roles.seed';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {}

  /** Au démarrage de l’app : garantit que admin / prestataire / client existent. */
  async onModuleInit(): Promise<void> {
    await seedRoles(this.roleModel);
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().sort({ name: 1 }).lean().exec();
  }

  async findByName(name: string): Promise<(Role & { _id: Types.ObjectId }) | null> {
    return this.roleModel
      .findOne({ name: name.toLowerCase().trim() })
      .lean()
      .exec() as Promise<(Role & { _id: Types.ObjectId }) | null>;
  }

  /** ObjectId du rôle « client » (inscription, comptes par défaut). */
  async getClientRoleId(): Promise<Types.ObjectId> {
    return this.getRoleIdByName(ROLE_NAMES.CLIENT);
  }

  async getRoleIdByName(name: string): Promise<Types.ObjectId> {
    const role = await this.findByName(name);
    if (!role) {
      throw new InternalServerErrorException(
        `Rôle "${name}" introuvable. Vérifiez que le seed a bien été exécuté.`,
      );
    }
    return role._id;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const name = dto.name.toLowerCase().trim();
    const exists = await this.roleModel.exists({ name });
    if (exists) {
      throw new ConflictException(`Le rôle "${name}" existe déjà`);
    }
    const created = await this.roleModel.create({
      name,
      label: dto.label?.trim(),
    });
    return created.toObject();
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const updated = await this.roleModel
      .findByIdAndUpdate(
        id,
        {
          ...(dto.label !== undefined && { label: dto.label?.trim() }),
          ...(dto.name !== undefined && { name: dto.name.toLowerCase().trim() }),
        },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Rôle introuvable');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.roleModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Rôle introuvable');
    }
  }
}
