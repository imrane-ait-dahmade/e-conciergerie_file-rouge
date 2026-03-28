import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Caracteristique,
  CaracteristiqueSchema,
} from '../caracteristiques/schemas/caracteristique.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
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
import {
  EtablissementServiceCaracteristique,
  EtablissementServiceCaracteristiqueSchema,
} from '../etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import { ProviderEstablishmentServiceCaracteristiquesController } from './provider-establishment-service-caracteristiques.controller';
import { ProviderEtablissementServiceCaracteristiquesIdController } from './provider-etablissement-service-caracteristiques-id.controller';
import { ProviderEtablissementServiceCaracteristiquesService } from './provider-etablissement-service-caracteristiques.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EtablissementServiceCaracteristique.name,
        schema: EtablissementServiceCaracteristiqueSchema,
      },
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: Caracteristique.name, schema: CaracteristiqueSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [
    ProviderEstablishmentServiceCaracteristiquesController,
    ProviderEtablissementServiceCaracteristiquesIdController,
  ],
  providers: [ProviderEtablissementServiceCaracteristiquesService, RolesGuard],
})
export class ProviderEtablissementServiceCaracteristiquesModule {}
