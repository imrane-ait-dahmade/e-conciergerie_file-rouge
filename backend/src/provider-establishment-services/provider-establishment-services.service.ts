import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  assertValidObjectId,
  ensurePrestataireOwnsEtablissement,
  ensurePrestataireOwnsEtablissementService,
} from '../auth/ownership/prestataire-ownership.util';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { Service } from '../services/schemas/service.schema';
import { CreateEtablissementServiceDto } from '../etablissement-services/dto/create-etablissement-service.dto';
import { UpdateEtablissementServiceDto } from '../etablissement-services/dto/update-etablissement-service.dto';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';

/**
 * Règles d’appartenance (prestataire = utilisateur JWT) :
 *
 * 1. **Établissement** : toute opération sur une assignation passe par l’établissement lié.
 *    On vérifie `Etablissement.prestataire === userId` avant création sur cet établissement,
 *    ou avant lecture/modification/suppression d’une ligne `EtablissementService` dont
 *    `etablissement` pointe vers cet établissement.
 *
 * 2. **Lecture liste globale** : on ne charge que les assignations dont `etablissement`
 *    appartient à l’ensemble des ids d’établissements du prestataire (`prestataire: userId`).
 *
 * 3. **Anti-IDOR** : si l’établissement n’appartient pas au prestataire (ou l’assignation
 *    ne concerne pas ses établissements), on répond **404** — sans indiquer si la ressource
 *    existe chez un autre compte.
 *
 * Le **catalogue** `Service` est validé par `exists` ; la liaison reste dans
 * `EtablissementService` (prix, commentaire).
 */
@Injectable()
export class ProviderEstablishmentServicesService {
  constructor(
    @InjectModel(EtablissementService.name)
    private readonly liaisonModel: Model<EtablissementService>,
    @InjectModel(Etablissement.name)
    private readonly etablissementModel: Model<Etablissement>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
  ) {}

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

  private async assertServiceCatalogExists(id: string): Promise<void> {
    assertValidObjectId(id, 'service');
    const ok = await this.serviceModel.exists({ _id: new Types.ObjectId(id) });
    if (!ok) {
      throw new NotFoundException('Service (catalogue) introuvable');
    }
  }

  private async getOwnedEtablissementIds(userId: string): Promise<Types.ObjectId[]> {
    const rows = await this.etablissementModel
      .find({ prestataire: new Types.ObjectId(userId) })
      .select('_id')
      .lean()
      .exec();
    return rows.map((r) => r._id as Types.ObjectId);
  }

  private isMongoDuplicateKey(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: number }).code === 11000
    );
  }

  /** Toutes les assignations dont l’établissement est à moi. */
  async findAllForProvider(userId: string) {
    const etabIds = await this.getOwnedEtablissementIds(userId);
    if (etabIds.length === 0) {
      return [];
    }
    return this.liaisonModel
      .find({ etablissement: { $in: etabIds } })
      .sort({ createdAt: -1 })
      .populate([...this.populateAssignment()])
      .lean()
      .exec();
  }

  /** Assignations pour un établissement donné (après vérification propriétaire). */
  async findByEtablissementForProvider(
    etablissementId: string,
    userId: string,
  ) {
    await ensurePrestataireOwnsEtablissement(
      this.etablissementModel,
      etablissementId,
      userId,
    );
    return this.liaisonModel
      .find({ etablissement: new Types.ObjectId(etablissementId) })
      .sort({ createdAt: -1 })
      .populate([...this.populateAssignment()])
      .lean()
      .exec();
  }

  async createForProvider(dto: CreateEtablissementServiceDto, userId: string) {
    await ensurePrestataireOwnsEtablissement(
      this.etablissementModel,
      dto.etablissement,
      userId,
    );
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
      return this.findOnePopulatedForProvider(String(created._id), userId);
    } catch (err: unknown) {
      if (this.isMongoDuplicateKey(err)) {
        throw new ConflictException(
          'Ce service est déjà assigné à cet établissement.',
        );
      }
      throw err;
    }
  }

  private async findOnePopulatedForProvider(
    liaisonId: string,
    userId: string,
  ) {
    await ensurePrestataireOwnsEtablissementService(
      this.liaisonModel,
      this.etablissementModel,
      liaisonId,
      userId,
    );
    const doc = await this.liaisonModel
      .findById(liaisonId)
      .populate([...this.populateAssignment()])
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException('Assignation introuvable');
    }
    return doc;
  }

  async updateForProvider(
    id: string,
    dto: UpdateEtablissementServiceDto,
    userId: string,
  ) {
    await ensurePrestataireOwnsEtablissementService(
      this.liaisonModel,
      this.etablissementModel,
      id,
      userId,
    );

    const set: Record<string, unknown> = {};
    if (dto.prix !== undefined) set.prix = dto.prix;
    if (dto.commentaire !== undefined) {
      set.commentaire = dto.commentaire.trim();
    }

    if (Object.keys(set).length === 0) {
      return this.findOnePopulatedForProvider(id, userId);
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

  async removeForProvider(id: string, userId: string): Promise<void> {
    await ensurePrestataireOwnsEtablissementService(
      this.liaisonModel,
      this.etablissementModel,
      id,
      userId,
    );
    const res = await this.liaisonModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Assignation introuvable');
    }
  }
}
