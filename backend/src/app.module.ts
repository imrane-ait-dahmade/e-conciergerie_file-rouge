import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { UploadsModule } from './uploads/uploads.module';
import { DomaineModule } from './domaines/domaine.module';
import { ServiceModule } from './services/service.module';
import { CaracteristiqueModule } from './caracteristiques/caracteristique.module';
import { ProviderEtablissementsModule } from './provider-etablissements/provider-etablissements.module';
import { ProviderEstablishmentServicesModule } from './provider-establishment-services/provider-establishment-services.module';
import { ProviderEtablissementServiceCaracteristiquesModule } from './provider-etablissement-service-caracteristiques/provider-etablissement-service-caracteristiques.module';
import { ProviderDashboardModule } from './provider-dashboard/provider-dashboard.module';
import { EtablissementServicesModule } from './etablissement-services/etablissement-services.module';
import { Favori, FavoriSchema } from './favoris/schemas/favori.schema';
import { Avis, AvisSchema } from './avis/schemas/avis.schema';
import { Reservation, ReservationSchema } from './reservations/schemas/reservation.schema';
import { Paiement, PaiementSchema } from './paiements/schemas/paiement.schema';
import { Abonnement, AbonnementSchema } from './abonnements/schemas/abonnement.schema';
import { MediaModule } from './media/media.module';
import { SliderModule } from './sliders/slider.module';
import { MobileModule } from './mobile/mobile.module';
import { Admin, AdminSchema } from './admins/schemas/admin.schema';
import { Prestataire, PrestataireSchema } from './prestataires/schemas/prestataire.schema';
import { Voyageur, VoyageurSchema } from './voyageurs/schemas/voyageur.schema';
import {
  EtablissementServiceCaracteristique,
  EtablissementServiceCaracteristiqueSchema,
} from './etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import {
  ServicePicture,
  ServicePictureSchema,
} from './service-pictures/schemas/service-picture.schema';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';

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
      { name: Favori.name, schema: FavoriSchema },
      { name: Avis.name, schema: AvisSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Paiement.name, schema: PaiementSchema },
      { name: Abonnement.name, schema: AbonnementSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Prestataire.name, schema: PrestataireSchema },
      { name: Voyageur.name, schema: VoyageurSchema },
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
    EtablissementServicesModule,
    PaysModule,
    VillesModule,
    QuartiersModule,
    UploadsModule,
    DomaineModule,
    ServiceModule,
    CaracteristiqueModule,
    ProviderEtablissementsModule,
    ProviderEstablishmentServicesModule,
    ProviderEtablissementServiceCaracteristiquesModule,
    ProviderDashboardModule,
    MediaModule,
    SliderModule,
    MobileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RequestContextMiddleware,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}