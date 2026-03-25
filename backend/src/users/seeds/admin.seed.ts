import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../roles/schemas/role.schema';
import { User } from '../schemas/user.schema';

/**
 * Seed admin initial — comme un AdminUserSeeder Laravel.
 *
 * Appel typique : depuis UsersService.createInitialAdmin() avec les valeurs lues du .env.
 */
export async function seedInitialAdmin(
  userModel: Model<User>,
  roleModel: Model<Role>,
  data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
  },
  logger?: Logger,
): Promise<void> {
  const email = data.email.toLowerCase().trim();
  const password = data.password;

  // Pas d’email ou pas de mot de passe → rien à faire (ex. variables .env non renseignées)
  if (!email || !password) {
    return;
  }

  // Étape 1 : récupérer le rôle nommé "admin" (équivalent Role::where('name','admin')->first())
  const adminRole = await roleModel.findOne({ name: 'admin' }).lean();
  if (!adminRole) {
    logger?.warn('Seed admin : rôle "admin" introuvable en base.');
    return;
  }

  // Étape 2 : cet email est-il déjà utilisé ? → si oui, on s’arrête sans erreur (idempotent)
  const userExisteDeja = await userModel.exists({ email });
  if (userExisteDeja) {
    return;
  }

  // Étape 3 : hasher le mot de passe avant enregistrement (équivalent Hash::make en Laravel)
  const passwordHash = await bcrypt.hash(password, 10);

  // Étape 4 : créer l’utilisateur et lier le rôle admin (champ role = _id du document Role)
  await userModel.create({
    nom: data.nom,
    prenom: data.prenom,
    email,
    password: passwordHash,
    isActive: true,
    role: adminRole._id as Types.ObjectId,
  });

  logger?.log(`Seed admin : compte créé pour ${email}.`);
}
