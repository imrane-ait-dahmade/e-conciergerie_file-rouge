import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pays } from '../pays/schemas/pays.schema';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { CreateVilleDto } from './dto/create-ville.dto';
import { ListVillesQueryDto } from './dto/list-villes-query.dto';
import { UpdateVilleDto } from './dto/update-ville.dto';
import { Ville } from './schemas/ville.schema';

@Injectable()
export class VillesService {
  constructor(
    @InjectModel(Ville.name) private villeModel: Model<Ville>,
    @InjectModel(Pays.name) private paysModel: Model<Pays>,
    @InjectModel(Quartier.name) private quartierModel: Model<Quartier>,
  ) {}

  private async assertPaysExists(paysId: string): Promise<void> {
    const exists = await this.paysModel.exists({ _id: paysId });
    if (!exists) {
      throw new NotFoundException('Pays introuvable');
    }
  }

  async create(dto: CreateVilleDto) {
    await this.assertPaysExists(dto.pays);
    return this.villeModel.create({
      nom: dto.nom,
      pays: new Types.ObjectId(dto.pays),
    });
  }

  async findAll(query?: ListVillesQueryDto) {
    const page = query?.page != null && query.page > 0 ? query.page : 1;
    const limit = Math.min(
      query?.limit != null && query.limit > 0 ? query.limit : 20,
      100,
    );
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (query?.countryId) {
      filter.pays = new Types.ObjectId(query.countryId);
    }
    const [data, total] = await Promise.all([
      this.villeModel
        .find(filter)
        .populate('pays', 'nom code')
        .sort({ nom: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.villeModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const ville = await this.villeModel
      .findById(id)
      .populate('pays', 'nom code')
      .exec();
    if (!ville) {
      throw new NotFoundException('Ville introuvable');
    }
    return ville;
  }

  async update(id: string, dto: UpdateVilleDto) {
    await this.findOne(id);
    const update: Record<string, unknown> = {};
    if (dto.nom !== undefined) {
      update.nom = dto.nom;
    }
    if (dto.pays !== undefined) {
      await this.assertPaysExists(dto.pays);
      update.pays = new Types.ObjectId(dto.pays);
    }
    return this.villeModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('pays', 'nom code')
      .exec();
  }

  async delete(id: string) {
    await this.findOne(id);
    const count = await this.quartierModel.countDocuments({
      ville: new Types.ObjectId(id),
    });
    if (count > 0) {
      throw new BadRequestException(
        'Impossible de supprimer cette ville : des quartiers y sont rattachés.',
      );
    }
    const removed = await this.villeModel.findByIdAndDelete(id);
    if (!removed) {
      throw new NotFoundException('Ville introuvable');
    }
    return removed;
  }
}
