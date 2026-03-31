import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Domaine } from '../domaines/schemas/domaine.schema';
import { DomaineService } from '../domaines/domaine.service';
import { seedServices } from './seeds/services.seed';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './schemas/service.schema';

const populatePaths = [{ path: 'domaine', select: 'nom description icon' }] as const;

@Injectable()
export class ServiceService implements OnModuleInit {
  private readonly logger = new Logger(ServiceService.name);

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Domaine.name) private domaineModel: Model<Domaine>,
    private domaineService: DomaineService,
  ) {}

  async onModuleInit(): Promise<void> {
    await seedServices(this.serviceModel, this.domaineModel, this.logger);
  }

  private assertValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant MongoDB invalide');
    }
  }

  /** Vérifie que le domaine existe (réutilise le CRUD Domaine). */
  private async assertDomaineExists(id: string): Promise<void> {
    await this.domaineService.findOne(id);
  }

  async create(dto: CreateServiceDto) {
    await this.assertDomaineExists(dto.domaine);

    const icon =
      dto.icon !== undefined && dto.icon.trim() !== '' ? dto.icon.trim() : undefined;

    return this.serviceModel.create({
      nom: dto.nom.trim(),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      domaine: new Types.ObjectId(dto.domaine),
      ...(icon !== undefined && { icon }),
    });
  }

  async findAll() {
    return this.serviceModel
      .find()
      .sort({ nom: 1 })
      .populate([...populatePaths])
      .lean()
      .exec();
  }

  async findOne(id: string) {
    this.assertValidObjectId(id);
    const doc = await this.serviceModel
      .findById(id)
      .populate([...populatePaths])
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException(`Service introuvable (id: ${id})`);
    }
    return doc;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    if (dto.domaine !== undefined) {
      await this.assertDomaineExists(dto.domaine);
    }

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    if (dto.nom !== undefined) {
      $set.nom = dto.nom.trim();
    }
    if (dto.description !== undefined) {
      $set.description = dto.description.trim();
    }
    if (dto.domaine !== undefined) {
      $set.domaine = new Types.ObjectId(dto.domaine);
    }
    if (dto.icon !== undefined) {
      const t = dto.icon.trim();
      if (t) {
        $set.icon = t;
      } else {
        $unset.icon = 1;
      }
    }

    const payload: Record<string, unknown> = {};
    if (Object.keys($set).length) {
      payload.$set = $set;
    }
    if (Object.keys($unset).length) {
      payload.$unset = $unset;
    }

    if (!Object.keys(payload).length) {
      return this.findOne(id);
    }

    const updated = await this.serviceModel
      .findByIdAndUpdate(id, payload, { new: true })
      .populate([...populatePaths])
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException(`Service introuvable (id: ${id})`);
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const removed = await this.serviceModel.findByIdAndDelete(id).lean().exec();
    if (!removed) {
      throw new NotFoundException(`Service introuvable (id: ${id})`);
    }
    return removed;
  }
}
