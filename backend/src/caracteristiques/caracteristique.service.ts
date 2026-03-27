import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { Service } from '../services/schemas/service.schema';
import { CreateCaracteristiqueDto } from './dto/create-caracteristique.dto';
import { UpdateCaracteristiqueDto } from './dto/update-caracteristique.dto';
import { Caracteristique } from './schemas/caracteristique.schema';

const populatePaths = [
  { path: 'service', select: 'nom description' },
  { path: 'etablissement', select: 'nom adresse' },
] as const;

@Injectable()
export class CaracteristiqueService {
  constructor(
    @InjectModel(Caracteristique.name)
    private caracteristiqueModel: Model<Caracteristique>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Etablissement.name)
    private etablissementModel: Model<Etablissement>,
  ) {}

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

  private async assertEtablissementExists(id: string): Promise<void> {
    this.assertValidObjectId(id);
    const doc = await this.etablissementModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException(`Établissement introuvable (id: ${id})`);
    }
  }

  async create(dto: CreateCaracteristiqueDto) {
    if (dto.service !== undefined) {
      await this.assertServiceExists(dto.service);
    }
    if (dto.etablissement !== undefined) {
      await this.assertEtablissementExists(dto.etablissement);
    }

    return this.caracteristiqueModel.create({
      libelle: dto.libelle.trim(),
      valeur: dto.valeur.trim(),
      ...(dto.service !== undefined && {
        service: new Types.ObjectId(dto.service),
      }),
      ...(dto.etablissement !== undefined && {
        etablissement: new Types.ObjectId(dto.etablissement),
      }),
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
    if (dto.etablissement !== undefined) {
      await this.assertEtablissementExists(dto.etablissement);
    }

    const update: Record<string, unknown> = {};
    if (dto.libelle !== undefined) {
      update.libelle = dto.libelle.trim();
    }
    if (dto.valeur !== undefined) {
      update.valeur = dto.valeur.trim();
    }
    if (dto.service !== undefined) {
      update.service = new Types.ObjectId(dto.service);
    }
    if (dto.etablissement !== undefined) {
      update.etablissement = new Types.ObjectId(dto.etablissement);
    }

    const updated = await this.caracteristiqueModel
      .findByIdAndUpdate(id, update, { new: true })
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
