import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Avis, AvisSchema } from '../avis/schemas/avis.schema';
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
import { Reservation, ReservationSchema } from '../reservations/schemas/reservation.schema';
import { ProviderDashboardController } from './provider-dashboard.controller';
import { ProviderDashboardService } from './provider-dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      {
        name: EtablissementServiceCaracteristique.name,
        schema: EtablissementServiceCaracteristiqueSchema,
      },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Avis.name, schema: AvisSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [ProviderDashboardController],
  providers: [ProviderDashboardService, RolesGuard],
})
export class ProviderDashboardModule {}
