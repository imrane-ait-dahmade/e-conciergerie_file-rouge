import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ville } from '../villes/schemas/ville.schema';
import { CreatePaysDto } from './dto/create-pays.dto';
import { UpdatePaysDto } from './dto/update-pays.dto';
import { Pays } from './schemas/pays.schema';

@Injectable()
export class PaysService {
  constructor(
    @InjectModel(Pays.name) private paysModel: Model<Pays>,
    @InjectModel(Ville.name) private villeModel: Model<Ville>,
  ) {}

  async create(dto: CreatePaysDto) {
    const payload = {
      nom: dto.nom,
      ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
    };
    return this.paysModel.create(payload);
  }

  async findAll() {
    return this.paysModel.find().sort({ nom: 1 }).exec();
  }

  async findOne(id: string) {
    const pays = await this.paysModel.findById(id);
    if (!pays) {
      throw new NotFoundException('Pays introuvable');
    }
    return pays;
  }

  async update(id: string, dto: UpdatePaysDto) {
    await this.findOne(id);
    const update: Record<string, unknown> = {};
    if (dto.nom !== undefined) {
      update.nom = dto.nom;
    }
    if (dto.code !== undefined) {
      update.code = dto.code.toUpperCase();
    }
    return this.paysModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string) {
    await this.findOne(id);
    const count = await this.villeModel.countDocuments({
      pays: new Types.ObjectId(id),
    });
    if (count > 0) {
      throw new BadRequestException(
        'Impossible de supprimer ce pays : des villes y sont rattachées.',
      );
    }
    const removed = await this.paysModel.findByIdAndDelete(id);
    if (!removed) {
      throw new NotFoundException('Pays introuvable');
    }
    return removed;
  }
}
