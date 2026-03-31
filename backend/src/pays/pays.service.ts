import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { Ville } from '../villes/schemas/ville.schema';
import { CreatePaysDto } from './dto/create-pays.dto';
import { UpdatePaysDto } from './dto/update-pays.dto';
import { Pays } from './schemas/pays.schema';
import { seedGeographieKenitra } from './seeds/geographie-kenitra.seed';

@Injectable()
export class PaysService implements OnModuleInit {
  private readonly logger = new Logger(PaysService.name);

  constructor(
    @InjectModel(Pays.name) private paysModel: Model<Pays>,
    @InjectModel(Ville.name) private villeModel: Model<Ville>,
    @InjectModel(Quartier.name) private quartierModel: Model<Quartier>,
  ) {}

  /** Référentiel Maroc / Kénitra / quartiers — idempotent, voir `seeds/geographie-kenitra.seed.ts`. */
  async onModuleInit(): Promise<void> {
    await seedGeographieKenitra(
      this.paysModel,
      this.villeModel,
      this.quartierModel,
      this.logger,
    );
  }

  async create(dto: CreatePaysDto) {
    const payload = {
      nom: dto.nom,
      ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
    };
    return this.paysModel.create(payload);
  }

  async findAll(query?: PaginationQueryDto) {
    const page = query?.page != null && query.page > 0 ? query.page : 1;
    const limit = Math.min(
      query?.limit != null && query.limit > 0 ? query.limit : 20,
      100,
    );
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.paysModel.find().sort({ nom: 1 }).skip(skip).limit(limit).exec(),
      this.paysModel.countDocuments().exec(),
    ]);
    return { data, total, page, limit };
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
