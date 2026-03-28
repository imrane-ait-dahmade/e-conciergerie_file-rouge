import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import {
  EtablissementService,
  EtablissementServiceSchema,
} from '../etablissement-services/schemas/etablissement-service.schema';
import { ProviderEstablishmentServicesController } from './provider-establishment-services.controller';
import { ProviderEtablissementEstablishmentServicesController } from './provider-etablissement-establishment-services.controller';
import { ProviderEstablishmentServicesService } from './provider-establishment-services.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [
    ProviderEstablishmentServicesController,
    ProviderEtablissementEstablishmentServicesController,
  ],
  providers: [ProviderEstablishmentServicesService, RolesGuard],
})
export class ProviderEstablishmentServicesModule {}
