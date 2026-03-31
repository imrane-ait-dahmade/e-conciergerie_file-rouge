import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../roles/schemas/role.schema';
import { ROLE_NAMES, type RoleName } from '../../roles/seeds/roles.seed';
import { User } from '../schemas/user.schema';

/**
 * Comptes de démo (3) — idempotent : si l’email existe déjà, aucune création ni erreur.
 * Mots de passe : bcrypt 10 rounds, aligné sur UsersService / AuthService.
 *
 * Rôles : voir `ROLE_NAMES` (voyageur = `client` dans le schéma métier).
 */
export const DEMO_USERS_SEED: ReadonlyArray<{
  email: string;
  password: string;
  nom: string;
  prenom: string;
  roleName: RoleName;
}> = [
  {
    email: 'admin@econciergerie.ma',
    password: 'Admin123!',
    nom: 'Admin',
    prenom: 'Demo',
    roleName: ROLE_NAMES.ADMIN,
  },
  {
    email: 'provider@econciergerie.ma',
    password: 'Provider123!',
    nom: 'Bennani',
    prenom: 'Youssef',
    roleName: ROLE_NAMES.PRESTATAIRE,
  },
  {
    email: 'traveler@econciergerie.ma',
    password: 'Traveler123!',
    nom: 'Alaoui',
    prenom: 'Sara',
    roleName: ROLE_NAMES.CLIENT,
  },
];

export async function seedDemoUsers(
  userModel: Model<User>,
  roleModel: Model<Role>,
  logger?: Logger,
): Promise<void> {
  for (const row of DEMO_USERS_SEED) {
    const email = row.email.toLowerCase().trim();

    const role = await roleModel.findOne({ name: row.roleName }).lean();
    if (!role) {
      logger?.warn(
        `Seed démo : rôle "${row.roleName}" introuvable — compte ${email} ignoré.`,
      );
      continue;
    }

    const exists = await userModel.exists({ email });
    if (exists) {
      continue;
    }

    const passwordHash = await bcrypt.hash(row.password, 10);

    await userModel.create({
      nom: row.nom,
      prenom: row.prenom,
      email,
      password: passwordHash,
      isActive: true,
      role: role._id,
    });

    logger?.log(`Seed démo : compte créé (${row.roleName}) — ${email}.`);
  }
}
