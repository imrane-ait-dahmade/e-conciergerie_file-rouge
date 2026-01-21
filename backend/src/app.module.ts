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
    UsersModule,
    RolesModule,
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