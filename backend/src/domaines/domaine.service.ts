import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { slugifyDomainNom } from './domaine-slug.util';
import { seedDomaines } from './seeds/domaines.seed';

import { CreateDomaineDto } from './dto/create-domaine.dto';

import { MobileDomainItemDto } from './dto/mobile-domain-item.dto';

import { UpdateDomaineDto } from './dto/update-domaine.dto';

import { Domaine } from './schemas/domaine.schema';



type DomaineLean = {

  _id: Types.ObjectId;

  nom?: string;

  slug?: string;

  icon?: string;

  isActive?: boolean;

  order?: number;

};



@Injectable()

export class DomaineService implements OnModuleInit {

  private readonly logger = new Logger(DomaineService.name);

  constructor(

    @InjectModel(Domaine.name) private domaineModel: Model<Domaine>,

  ) {}



  /** Domaines de référence Home mobile — idempotent (seeds/domaines.seed.ts). */

  async onModuleInit(): Promise<void> {

    await seedDomaines(this.domaineModel, this.logger);

  }



  /** Vérifie que l’id ressemble à un ObjectId MongoDB avant d’interroger la base. */

  private assertValidObjectId(id: string): void {

    if (!Types.ObjectId.isValid(id)) {

      throw new BadRequestException('Identifiant MongoDB invalide');

    }

  }



  async create(dto: CreateDomaineDto) {

    const nom = dto.nom.trim();

    const icon =

      dto.icon !== undefined && dto.icon.trim() !== ''

        ? dto.icon.trim()

        : undefined;

    const slug =

      dto.slug !== undefined && dto.slug.trim() !== ''

        ? dto.slug.trim().toLowerCase()

        : slugifyDomainNom(nom);



    return this.domaineModel.create({

      nom,

      slug,

      isActive: dto.isActive ?? true,

      order: dto.order ?? 0,

      ...(dto.description !== undefined && { description: dto.description.trim() }),

      ...(icon !== undefined && { icon }),

    });

  }



  async findAll() {

    return this.domaineModel.find().sort({ nom: 1 }).lean().exec();

  }



  /**

   * Domaines visibles sur la Home mobile : actifs uniquement, tri par `order` puis nom.

   * Documents sans `isActive` / `order` (données anciennes) sont traités comme actifs / ordre 0.

   */

  async findActiveForMobileHome(): Promise<MobileDomainItemDto[]> {

    const rows = await this.domaineModel

      .find({ isActive: { $ne: false } })

      .lean<DomaineLean[]>()

      .exec();



    const sorted = [...rows].sort((a, b) => {

      const oa = typeof a.order === 'number' ? a.order : 0;

      const ob = typeof b.order === 'number' ? b.order : 0;

      if (oa !== ob) {

        return oa - ob;

      }

      return (a.nom ?? '').localeCompare(b.nom ?? '', 'fr');

    });



    return sorted.map((doc) => this.toMobileDomainItem(doc));

  }



  private toMobileDomainItem(doc: DomaineLean): MobileDomainItemDto {

    const nom = doc.nom?.trim() ?? '';

    const slugPersisted = doc.slug?.trim();

    const slug =

      slugPersisted && slugPersisted !== ''

        ? slugPersisted.toLowerCase()

        : slugifyDomainNom(nom);



    return {

      id: String(doc._id),

      name: nom,

      slug,

      icon: doc.icon?.trim() ? doc.icon.trim() : null,

      isActive: doc.isActive !== false,

      order: typeof doc.order === 'number' ? doc.order : 0,

    };

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

    const $set: Record<string, unknown> = {};

    const $unset: Record<string, 1> = {};

    if (dto.nom !== undefined) {

      $set.nom = dto.nom.trim();

    }

    if (dto.description !== undefined) {

      $set.description = dto.description.trim();

    }

    if (dto.icon !== undefined) {

      const t = dto.icon.trim();

      if (t) {

        $set.icon = t;

      } else {

        $unset.icon = 1;

      }

    }

    if (dto.slug !== undefined) {

      const t = dto.slug.trim().toLowerCase();

      if (t) {

        $set.slug = t;

      } else {

        $unset.slug = 1;

      }

    }

    if (dto.isActive !== undefined) {

      $set.isActive = dto.isActive;

    }

    if (dto.order !== undefined) {

      $set.order = dto.order;

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

    const updated = await this.domaineModel

      .findByIdAndUpdate(id, payload, { new: true })

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


