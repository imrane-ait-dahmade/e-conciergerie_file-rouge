import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Domaine, DomaineSchema } from '../domaines/schemas/domaine.schema';
import {
  EtablissementServiceCaracteristique,
  EtablissementServiceCaracteristiqueSchema,
} from '../etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import { MediaModule } from '../media/media.module';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EtablissementServicesMediaController } from './etablissement-services-media.controller';
import { EtablissementServicesNestedController } from './etablissement-services-nested.controller';
import { EtablissementServicesController } from './etablissement-services.controller';
import { EtablissementServicesService } from './etablissement-services.service';
import {
  EtablissementService,
  EtablissementServiceSchema,
} from './schemas/etablissement-service.schema';

@Module({
  imports: [
    MediaModule,
    MongooseModule.forFeature([
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: EtablissementServiceCaracteristique.name, schema: EtablissementServiceCaracteristiqueSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Domaine.name, schema: DomaineSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [
    EtablissementServicesController,
    EtablissementServicesNestedController,
    EtablissementServicesMediaController,
  ],
  providers: [EtablissementServicesService, RolesGuard],
  exports: [MongooseModule],
})
export class EtablissementServicesModule {}
