import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Caracteristique, CaracteristiqueSchema } from '../caracteristiques/schemas/caracteristique.schema';
import { Domaine, DomaineSchema } from '../domaines/schemas/domaine.schema';
import {
  EtablissementService,
  EtablissementServiceSchema,
} from '../etablissement-services/schemas/etablissement-service.schema';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import { Media, MediaSchema } from '../media/schemas/media.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Quartier, QuartierSchema } from '../quartiers/schemas/quartier.schema';
import { Ville, VilleSchema } from '../villes/schemas/ville.schema';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Domaine.name, schema: DomaineSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Caracteristique.name, schema: CaracteristiqueSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: Ville.name, schema: VilleSchema },
      { name: Quartier.name, schema: QuartierSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, RolesGuard],
})
export class AdminDashboardModule {}
