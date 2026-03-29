import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Etablissement } from '../../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../../etablissement-services/schemas/etablissement-service.schema';
import { EtablissementServiceCaracteristique } from '../../etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';

/**
 * Vérifie qu’un identifiant MongoDB est valide (sinon 400).
 */
export function assertValidObjectId(id: string, label: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Identifiant ${label} invalide`);
  }
}

/**
 * Vérifie qu’un établissement existe **et** appartient au prestataire (`prestataire` = userId).
 * Sinon **404** (comportement anti-IDOR : on ne révèle pas l’existence chez un autre compte).
 *
 * À appeler depuis les **services** après les guards (JWT + rôle prestataire).
 */
export async function ensurePrestataireOwnsEtablissement(
  etablissementModel: Model<Etablissement>,
  etablissementId: string,
  userId: string,
): Promise<void> {
  assertValidObjectId(etablissementId, 'établissement');
  const ok = await etablissementModel.exists({
    _id: new Types.ObjectId(etablissementId),
    prestataire: new Types.ObjectId(userId),
  });
  if (!ok) {
    throw new NotFoundException('Établissement introuvable');
  }
}

/**
 * Chaîne : **EtablissementService** → `etablissement` → `Etablissement.prestataire` = userId.
 * Utilisé pour toute opération sur une ligne `etablissement_services` (offre).
 */
export async function ensurePrestataireOwnsEtablissementService(
  liaisonModel: Model<EtablissementService>,
  etablissementModel: Model<Etablissement>,
  etablissementServiceId: string,
  userId: string,
): Promise<void> {
  assertValidObjectId(etablissementServiceId, 'assignation');
  const row = await liaisonModel
    .findById(etablissementServiceId)
    .select('etablissement')
    .lean()
    .exec();
  if (!row) {
    throw new NotFoundException('Assignation introuvable');
  }
  await ensurePrestataireOwnsEtablissement(
    etablissementModel,
    String(row.etablissement),
    userId,
  );
}

/**
 * Chaîne : **EtablissementServiceCaracteristique** → `etablissementService` → … → `prestataire`.
 * Pour les lignes de caractéristiques rattachées à une offre.
 */
export async function ensurePrestataireOwnsEtablissementServiceCaracteristique(
  escModel: Model<EtablissementServiceCaracteristique>,
  liaisonModel: Model<EtablissementService>,
  etablissementModel: Model<Etablissement>,
  escId: string,
  userId: string,
): Promise<void> {
  assertValidObjectId(escId, 'caractéristique');
  const row = await escModel
    .findById(escId)
    .select('etablissementService')
    .lean()
    .exec();
  if (!row) {
    throw new NotFoundException('Caractéristique d’offre introuvable');
  }
  await ensurePrestataireOwnsEtablissementService(
    liaisonModel,
    etablissementModel,
    String(row.etablissementService),
    userId,
  );
}
