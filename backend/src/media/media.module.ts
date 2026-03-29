import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import {
  EtablissementService,
  EtablissementServiceSchema,
} from '../etablissement-services/schemas/etablissement-service.schema';
import { Pays, PaysSchema } from '../pays/schemas/pays.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Ville, VilleSchema } from '../villes/schemas/ville.schema';
import { UploadsModule } from '../uploads/uploads.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { Media, MediaSchema } from './schemas/media.schema';

/**
 * Module médias : upload MinIO, métadonnées MongoDB, accès admin ou prestataire.
 */
@Module({
  imports: [
    UploadsModule,
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: Pays.name, schema: PaysSchema },
      { name: Ville.name, schema: VilleSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [MediaController],
  providers: [MediaService, RolesGuard],
  exports: [MediaService],
})
export class MediaModule {}
