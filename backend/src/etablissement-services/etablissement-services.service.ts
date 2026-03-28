import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { Service } from '../services/schemas/service.schema';
import { CreateEtablissementServiceDto } from './dto/create-etablissement-service.dto';
import { ListEtablissementServicesQueryDto } from './dto/list-etablissement-services-query.dto';
import { UpdateEtablissementServiceDto } from './dto/update-etablissement-service.dto';
import { EtablissementService } from './schemas/etablissement-service.schema';

@Injectable()
export class EtablissementServicesService {
  constructor(
    @InjectModel(EtablissementService.name)
    private readonly liaisonModel: Model<EtablissementService>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
  ) {}

  private assertValidObjectId(id: string, label: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Identifiant ${label} invalide`);
    }
  }

  private populateAssignment() {
    return [
      {
        path: 'etablissement',
        select: 'nom adresse isActive prestataire',
      },
      {
        path: 'service',
        select: 'nom description',
        populate: { path: 'domaine', select: 'nom' },
      },
    ] as const;
  }

  private async assertEtablissementExists(id: string): Promise<void> {
    const ok = await this.etablissementModel.exists({
      _id: new Types.ObjectId(id),
    });
    if (!ok) {
      throw new NotFoundException('Établissement introuvable');
    }
  }

  private async assertServiceCatalogExists(id: string): Promise<void> {
    const ok = await this.serviceModel.exists({ _id: new Types.ObjectId(id) });
    if (!ok) {
      throw new NotFoundException('Service (catalogue) introuvable');
    }
  }

  async create(dto: CreateEtablissementServiceDto) {
    await this.assertEtablissementExists(dto.etablissement);
    await this.assertServiceCatalogExists(dto.service);

    const etabOid = new Types.ObjectId(dto.etablissement);
    const serviceOid = new Types.ObjectId(dto.service);

    const duplicate = await this.liaisonModel.exists({
      etablissement: etabOid,
      service: serviceOid,
    });
    if (duplicate) {
      throw new ConflictException(
        'Ce service est déjà assigné à cet établissement.',
      );
    }

    try {
      const created = await this.liaisonModel.create({
        etablissement: etabOid,
        service: serviceOid,
        ...(dto.prix !== undefined && { prix: dto.prix }),
        ...(dto.commentaire !== undefined && {
          commentaire: dto.commentaire.trim(),
        }),
      });
      return this.findOne(String(created._id));
    } catch (err: unknown) {
      if (this.isMongoDuplicateKey(err)) {
        throw new ConflictException(
          'Ce service est déjà assigné à cet établissement.',
        );
      }
      throw err;
    }
  }

  private isMongoDuplicateKey(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: number }).code === 11000
    );
  }

  async findAllPaginated(query?: ListEtablissementServicesQueryDto) {
    const page = query?.page != null && query.page > 0 ? query.page : 1;
    const limit = Math.min(
      query?.limit != null && query.limit > 0 ? query.limit : 20,
      100,
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query?.etablissementId) {
      this.assertValidObjectId(query.etablissementId, 'établissement');
      filter.etablissement = new Types.ObjectId(query.etablissementId);
    }

    const [data, total] = await Promise.all([
      this.liaisonModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate([...this.populateAssignment()])
        .lean()
        .exec(),
      this.liaisonModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findByEtablissement(etablissementId: string) {
    this.assertValidObjectId(etablissementId, 'établissement');
    await this.assertEtablissementExists(etablissementId);

    return this.liaisonModel
      .find({ etablissement: new Types.ObjectId(etablissementId) })
      .sort({ createdAt: -1 })
      .populate([...this.populateAssignment()])
      .lean()
      .exec();
  }

  async findOne(id: string) {
    this.assertValidObjectId(id, 'liaison');
    const doc = await this.liaisonModel
      .findById(id)
      .populate([...this.populateAssignment()])
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException('Assignation introuvable');
    }
    return doc;
  }

  async update(id: string, dto: UpdateEtablissementServiceDto) {
    this.assertValidObjectId(id, 'liaison');
    await this.findOne(id);

    const set: Record<string, unknown> = {};
    if (dto.prix !== undefined) set.prix = dto.prix;
    if (dto.commentaire !== undefined) {
      set.commentaire = dto.commentaire.trim();
    }

    if (Object.keys(set).length === 0) {
      return this.findOne(id);
    }

    const updated = await this.liaisonModel
      .findByIdAndUpdate(id, { $set: set }, { new: true })
      .populate([...this.populateAssignment()])
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Assignation introuvable');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.assertValidObjectId(id, 'liaison');
    const res = await this.liaisonModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Assignation introuvable');
    }
  }
}
