import { Model } from 'mongoose';
import { Role } from '../schemas/role.schema';

/** Noms techniques des rôles métier (à utiliser avec @Roles('admin'), etc.). */
export const ROLE_NAMES = {
  ADMIN: 'admin',
  PRESTATAIRE: 'prestataire',
  CLIENT: 'client',
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

/** Données insérées en base si le rôle n’existe pas encore (upsert). */
export const DEFAULT_ROLES: ReadonlyArray<{ name: RoleName; label: string }> = [
  { name: ROLE_NAMES.ADMIN, label: 'Administrateur' },
  { name: ROLE_NAMES.PRESTATAIRE, label: 'Prestataire' },
  { name: ROLE_NAMES.CLIENT, label: 'Client' },
];

/**
 * Insère ou met à jour les rôles par défaut (idempotent).
 * Appelé au démarrage par RolesService ; peut aussi être lancé depuis un script CLI.
 */
export async function seedRoles(roleModel: Model<Role>): Promise<void> {
  for (const row of DEFAULT_ROLES) {
    await roleModel.findOneAndUpdate(
      { name: row.name },
      { $set: { name: row.name, label: row.label } },
      { upsert: true, new: true },
    );
  }
}
