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

  async findAll() {
    return this.villeModel.find().populate('pays', 'nom code').sort({ nom: 1 }).exec();
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
