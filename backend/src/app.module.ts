import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { configuration, validationSchema } from './config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EtablissementsModule } from './etablissements/etablissements.module';
import { PaysModule } from './pays/pays.module';
import { VillesModule } from './villes/villes.module';
import { QuartiersModule } from './quartiers/quartiers.module';
import { Domaine, DomaineSchema } from './domaines/schemas/domaine.schema';
import { Service, ServiceSchema } from './services/schemas/service.schema';
import { Caracteristique, CaracteristiqueSchema } from './caracteristiques/schemas/caracteristique.schema';
import { Favori, FavoriSchema } from './favoris/schemas/favori.schema';
import { Avis, AvisSchema } from './avis/schemas/avis.schema';
import { Reservation, ReservationSchema } from './reservations/schemas/reservation.schema';
import { Paiement, PaiementSchema } from './paiements/schemas/paiement.schema';
import { Abonnement, AbonnementSchema } from './abonnements/schemas/abonnement.schema';
import { Media, MediaSchema } from './media/schemas/media.schema';
import { Admin, AdminSchema } from './admins/schemas/admin.schema';
import { Prestataire, PrestataireSchema } from './prestataires/schemas/prestataire.schema';
import { Voyageur, VoyageurSchema } from './voyageurs/schemas/voyageur.schema';
import {
  EtablissementService,
  EtablissementServiceSchema,
} from './etablissement-services/schemas/etablissement-service.schema';
import {
  EtablissementServiceCaracteristique,
  EtablissementServiceCaracteristiqueSchema,
} from './etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import {
  ServicePicture,
  ServicePictureSchema,
} from './service-pictures/schemas/service-picture.schema';

/**
 * Module racine de l'application.
 *
 * STRUCTURE SIMPLIFIÉE (3 modules essentiels) :
 * - UsersModule  : gestion des utilisateurs, profil
 * - AuthModule   : login, signup, refresh, logout (JWT)
 * - EtablissementsModule : CRUD établissements
 *
 * Les autres modules (Pays, Villes, Quartiers, Roles, Mail) sont optionnels.
 * Voir docs/ARCHITECTURE_SIMPLE.md pour plus de détails.
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 }, // 100 req/min default; auth controller overrides to 10
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: true },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('mongodb.url'),
      }),
      inject: [ConfigService],
    }),
    // Schémas métier sans module dédié : enregistrement Mongoose ici (fichiers *.schema.ts uniquement).
    MongooseModule.forFeature([
      { name: Domaine.name, schema: DomaineSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Caracteristique.name, schema: CaracteristiqueSchema },
      { name: Favori.name, schema: FavoriSchema },
      { name: Avis.name, schema: AvisSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Paiement.name, schema: PaiementSchema },
      { name: Abonnement.name, schema: AbonnementSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Prestataire.name, schema: PrestataireSchema },
      { name: Voyageur.name, schema: VoyageurSchema },
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      {
        name: EtablissementServiceCaracteristique.name,
        schema: EtablissementServiceCaracteristiqueSchema,
      },
      { name: ServicePicture.name, schema: ServicePictureSchema },
    ]),
    // Roles avant Users : le seed des rôles (RolesService.onModuleInit) tourne avant le seed admin (UsersService.onModuleInit).
    RolesModule,
    UsersModule,
    AuthModule,
    MailModule,
    EtablissementsModule,
    PaysModule,
    VillesModule,
    QuartiersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}