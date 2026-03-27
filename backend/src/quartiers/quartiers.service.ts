import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ville } from '../villes/schemas/ville.schema';
import { CreateQuartierDto } from './dto/create-quartier.dto';
import { ListQuartiersQueryDto } from './dto/list-quartiers-query.dto';
import { UpdateQuartierDto } from './dto/update-quartier.dto';
import { Quartier } from './schemas/quartier.schema';

@Injectable()
export class QuartiersService {
  constructor(
    @InjectModel(Quartier.name) private quartierModel: Model<Quartier>,
    @InjectModel(Ville.name) private villeModel: Model<Ville>,
  ) {}

  private async assertVilleExists(villeId: string): Promise<void> {
    const exists = await this.villeModel.exists({ _id: villeId });
    if (!exists) {
      throw new NotFoundException('Ville introuvable');
    }
  }

  async create(dto: CreateQuartierDto) {
    await this.assertVilleExists(dto.ville);
    return this.quartierModel.create({
      nom: dto.nom,
      ville: new Types.ObjectId(dto.ville),
    });
  }

  private villePopulate() {
    return {
      path: 'ville',
      select: 'nom pays',
      populate: { path: 'pays', select: 'nom code' },
    } as const;
  }

  async findAll(query?: ListQuartiersQueryDto) {
    const page = query?.page != null && query.page > 0 ? query.page : 1;
    const limit = Math.min(
      query?.limit != null && query.limit > 0 ? query.limit : 20,
      100,
    );
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (query?.cityId) {
      filter.ville = new Types.ObjectId(query.cityId);
    }
    const [data, total] = await Promise.all([
      this.quartierModel
        .find(filter)
        .populate(this.villePopulate())
        .sort({ nom: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.quartierModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const quartier = await this.quartierModel
      .findById(id)
      .populate(this.villePopulate())
      .exec();
    if (!quartier) {
      throw new NotFoundException('Quartier introuvable');
    }
    return quartier;
  }

  async update(id: string, dto: UpdateQuartierDto) {
    await this.findOne(id);
    const update: Record<string, unknown> = {};
    if (dto.nom !== undefined) {
      update.nom = dto.nom;
    }
    if (dto.ville !== undefined) {
      await this.assertVilleExists(dto.ville);
      update.ville = new Types.ObjectId(dto.ville);
    }
    return this.quartierModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate(this.villePopulate())
      .exec();
  }

  async delete(id: string) {
    const removed = await this.quartierModel.findByIdAndDelete(id);
    if (!removed) {
      throw new NotFoundException('Quartier introuvable');
    }
    return removed;
  }
}
