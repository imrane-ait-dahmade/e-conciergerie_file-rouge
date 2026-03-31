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
import { Service } from '../services/schemas/service.schema';
import { seedCaracteristiques } from './seeds/caracteristiques.seed';
import { CreateCaracteristiqueDto } from './dto/create-caracteristique.dto';
import { UpdateCaracteristiqueDto } from './dto/update-caracteristique.dto';
import { Caracteristique } from './schemas/caracteristique.schema';

const populatePaths = [{ path: 'service', select: 'nom description icon' }] as const;

@Injectable()
export class CaracteristiqueService implements OnModuleInit {
  private readonly logger = new Logger(CaracteristiqueService.name);

  constructor(
    @InjectModel(Caracteristique.name)
    private caracteristiqueModel: Model<Caracteristique>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Domaine.name) private domaineModel: Model<Domaine>,
  ) {}

  async onModuleInit(): Promise<void> {
    await seedCaracteristiques(
      this.caracteristiqueModel,
      this.serviceModel,
      this.domaineModel,
      this.logger,
    );
  }

  private assertValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant MongoDB invalide');
    }
  }

  private async assertServiceExists(id: string): Promise<void> {
    this.assertValidObjectId(id);
    const doc = await this.serviceModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException(`Service introuvable (id: ${id})`);
    }
  }

  async create(dto: CreateCaracteristiqueDto) {
    if (dto.service !== undefined) {
      await this.assertServiceExists(dto.service);
    }

    const icon =
      dto.icon !== undefined && dto.icon.trim() !== '' ? dto.icon.trim() : undefined;

    return this.caracteristiqueModel.create({
      libelle: dto.libelle.trim(),
      ...(dto.service !== undefined && {
        service: new Types.ObjectId(dto.service),
      }),
      ...(icon !== undefined && { icon }),
    });
  }

  async findAll() {
    return this.caracteristiqueModel
      .find()
      .sort({ libelle: 1 })
      .populate([...populatePaths])
      .lean()
      .exec();
  }

  async findOne(id: string) {
    this.assertValidObjectId(id);
    const doc = await this.caracteristiqueModel
      .findById(id)
      .populate([...populatePaths])
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException(`Caractéristique introuvable (id: ${id})`);
    }
    return doc;
  }

  async update(id: string, dto: UpdateCaracteristiqueDto) {
    await this.findOne(id);
    if (dto.service !== undefined) {
      await this.assertServiceExists(dto.service);
    }

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    if (dto.libelle !== undefined) {
      $set.libelle = dto.libelle.trim();
    }
    if (dto.service !== undefined) {
      $set.service = new Types.ObjectId(dto.service);
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

    const updated = await this.caracteristiqueModel
      .findByIdAndUpdate(id, payload, { new: true })
      .populate([...populatePaths])
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException(`Caractéristique introuvable (id: ${id})`);
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const removed = await this.caracteristiqueModel
      .findByIdAndDelete(id)
      .lean()
      .exec();
    if (!removed) {
      throw new NotFoundException(`Caractéristique introuvable (id: ${id})`);
    }
    return removed;
  }
}
