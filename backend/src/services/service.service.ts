import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DomaineService } from '../domaines/domaine.service';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './schemas/service.schema';

const populatePaths = [
  { path: 'domaine', select: 'nom description' },
  { path: 'etablissement', select: 'nom adresse' },
] as const;

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Etablissement.name)
    private etablissementModel: Model<Etablissement>,
    private domaineService: DomaineService,
  ) {}

  private assertValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant MongoDB invalide');
    }
  }

  /** Vérifie que l’établissement existe. */
  private async assertEtablissementExists(id: string): Promise<void> {
    this.assertValidObjectId(id);
    const doc = await this.etablissementModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException(`Établissement introuvable (id: ${id})`);
    }
  }

  /** Vérifie que le domaine existe (réutilise le CRUD Domaine). */
  private async assertDomaineExists(id: string): Promise<void> {
    await this.domaineService.findOne(id);
  }

  async create(dto: CreateServiceDto) {
    await this.assertEtablissementExists(dto.etablissement);
    await this.assertDomaineExists(dto.domaine);

    return this.serviceModel.create({
      nom: dto.nom.trim(),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      etablissement: new Types.ObjectId(dto.etablissement),
      domaine: new Types.ObjectId(dto.domaine),
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
    if (dto.etablissement !== undefined) {
      await this.assertEtablissementExists(dto.etablissement);
    }
    if (dto.domaine !== undefined) {
      await this.assertDomaineExists(dto.domaine);
    }

    const update: Record<string, unknown> = {};
    if (dto.nom !== undefined) {
      update.nom = dto.nom.trim();
    }
    if (dto.description !== undefined) {
      update.description = dto.description.trim();
    }
    if (dto.etablissement !== undefined) {
      update.etablissement = new Types.ObjectId(dto.etablissement);
    }
    if (dto.domaine !== undefined) {
      update.domaine = new Types.ObjectId(dto.domaine);
    }

    const updated = await this.serviceModel
      .findByIdAndUpdate(id, update, { new: true })
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
