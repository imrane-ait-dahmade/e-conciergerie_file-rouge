/**
 * Module Utilisateurs.
 * Gère les utilisateurs (schéma User) et le profil.
 * Exporte MongooseModule pour que Auth et Etablissements puissent utiliser le modèle User.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Abonnement, AbonnementSchema } from '../abonnements/schemas/abonnement.schema';
import { Admin, AdminSchema } from '../admins/schemas/admin.schema';
import { Avis, AvisSchema } from '../avis/schemas/avis.schema';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import { Favori, FavoriSchema } from '../favoris/schemas/favori.schema';
import { Paiement, PaiementSchema } from '../paiements/schemas/paiement.schema';
import { Prestataire, PrestataireSchema } from '../prestataires/schemas/prestataire.schema';
import { Reservation, ReservationSchema } from '../reservations/schemas/reservation.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { RolesModule } from '../roles/roles.module';
import { Voyageur, VoyageurSchema } from '../voyageurs/schemas/voyageur.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    RolesModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Voyageur.name, schema: VoyageurSchema },
      { name: Prestataire.name, schema: PrestataireSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Favori.name, schema: FavoriSchema },
      { name: Avis.name, schema: AvisSchema },
      { name: Abonnement.name, schema: AbonnementSchema },
      { name: Paiement.name, schema: PaiementSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.expiresIn') ?? '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UsersService, AdminUsersService, RolesGuard],
  controllers: [UsersController, AdminUsersController],
  exports: [MongooseModule],
})
export class UsersModule {}
