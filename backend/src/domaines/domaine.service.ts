import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDomaineDto } from './dto/create-domaine.dto';
import { UpdateDomaineDto } from './dto/update-domaine.dto';
import { Domaine } from './schemas/domaine.schema';

@Injectable()
export class DomaineService {
  constructor(
    @InjectModel(Domaine.name) private domaineModel: Model<Domaine>,
  ) {}

  /** Vérifie que l’id ressemble à un ObjectId MongoDB avant d’interroger la base. */
  private assertValidObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant MongoDB invalide');
    }
  }

  async create(dto: CreateDomaineDto) {
    return this.domaineModel.create({
      nom: dto.nom.trim(),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
    });
  }

  async findAll() {
    return this.domaineModel.find().sort({ nom: 1 }).lean().exec();
  }

  async findOne(id: string) {
    this.assertValidObjectId(id);
    const doc = await this.domaineModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException(`Domaine introuvable (id: ${id})`);
    }
    return doc;
  }

  async update(id: string, dto: UpdateDomaineDto) {
    await this.findOne(id);
    const update: Record<string, string> = {};
    if (dto.nom !== undefined) {
      update.nom = dto.nom.trim();
    }
    if (dto.description !== undefined) {
      update.description = dto.description.trim();
    }
    const updated = await this.domaineModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException(`Domaine introuvable (id: ${id})`);
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const removed = await this.domaineModel.findByIdAndDelete(id).lean().exec();
    if (!removed) {
      throw new NotFoundException(`Domaine introuvable (id: ${id})`);
    }
    return removed;
  }
}
