import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Quartier } from '../../quartiers/schemas/quartier.schema';
import { Ville } from '../../villes/schemas/ville.schema';
import { Pays } from '../schemas/pays.schema';

/** Référence stable pour retrouver le pays (nom unique en base). */
export const DEMO_PAYS = {
  nom: 'Maroc',
  code: 'MA',
} as const;

/** Ville de démo liée à ce pays. */
export const DEMO_VILLE = {
  nom: 'Kénitra',
} as const;

/** Quartiers de Kénitra — ordre d’affichage possible côté UI (liste fixe). */
export const DEMO_QUARTIERS_KENITRA = [
  'Maamora',
  'Centre Ville',
  'Bir Rami',
  'Val Fleuri',
  'El Haddada',
] as const;

/**
 * Seed géographique centré sur Kénitra (Maroc).
 *
 * Idempotent :
 * - pays : upsert sur `nom` (unique) — met à jour le code ISO si besoin ;
 * - ville : une seule ligne « Kénitra » pour ce pays (recherche par nom + pays) ;
 * - quartiers : pas de doublon pour le couple (nom, ville).
 *
 * Les schémas actuels n’ont pas slug / isActive / coords sur ville-quartier : seuls nom + refs sont renseignés.
 */
export async function seedGeographieKenitra(
  paysModel: Model<Pays>,
  villeModel: Model<Ville>,
  quartierModel: Model<Quartier>,
  logger?: Logger,
): Promise<void> {
  const pays = await paysModel.findOneAndUpdate(
    { nom: DEMO_PAYS.nom },
    { $set: { nom: DEMO_PAYS.nom, code: DEMO_PAYS.code } },
    { upsert: true, new: true },
  );

  const paysId = pays._id as Types.ObjectId;

  let ville = await villeModel
    .findOne({
      nom: DEMO_VILLE.nom,
      pays: paysId,
    })
    .exec();

  if (!ville) {
    ville = await villeModel.create({
      nom: DEMO_VILLE.nom,
      pays: paysId,
    });
    logger?.log(
      `Seed géo Kénitra : ville créée — ${DEMO_VILLE.nom} (pays ${DEMO_PAYS.nom}).`,
    );
  }

  const villeId = ville._id as Types.ObjectId;

  let quartiersCrees = 0;
  for (const nomQuartier of DEMO_QUARTIERS_KENITRA) {
    const exists = await quartierModel.exists({
      nom: nomQuartier,
      ville: villeId,
    });
    if (exists) {
      continue;
    }
    await quartierModel.create({
      nom: nomQuartier,
      ville: villeId,
    });
    quartiersCrees += 1;
  }

  logger?.log(
    `Seed géo Kénitra : pays « ${DEMO_PAYS.nom} » (${DEMO_PAYS.code}), ville « ${DEMO_VILLE.nom} », quartiers créés cette fois : ${quartiersCrees} (total attendu : ${DEMO_QUARTIERS_KENITRA.length}).`,
  );
}
