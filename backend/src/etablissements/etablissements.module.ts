/**
 * Module Établissements - CRUD simple.
 * POST / PUT / DELETE protégés par JWT.
 * GET tous et GET par id = publics.
 *
 * CRUD admin : `/admin/etablissements` (rôle admin).
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Avis, AvisSchema } from '../avis/schemas/avis.schema';
import { Domaine, DomaineSchema } from '../domaines/schemas/domaine.schema';
import {
  EtablissementService,
  EtablissementServiceSchema,
} from '../etablissement-services/schemas/etablissement-service.schema';
import { Favori, FavoriSchema } from '../favoris/schemas/favori.schema';
import { Pays, PaysSchema } from '../pays/schemas/pays.schema';
import { Quartier, QuartierSchema } from '../quartiers/schemas/quartier.schema';
import { Reservation, ReservationSchema } from '../reservations/schemas/reservation.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Ville, VilleSchema } from '../villes/schemas/ville.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminEtablissementsController } from './admin-etablissements.controller';
import { AdminEtablissementsService } from './admin-etablissements.service';
import {
  Etablissement,
  EtablissementSchema,
} from './schemas/etablissement.schema';
import { EtablissementsController } from './etablissements.controller';
import { EtablissementsService } from './etablissements.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Domaine.name, schema: DomaineSchema },
      { name: Pays.name, schema: PaysSchema },
      { name: Ville.name, schema: VilleSchema },
      { name: Quartier.name, schema: QuartierSchema },
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Favori.name, schema: FavoriSchema },
      { name: Avis.name, schema: AvisSchema },
    ]),
  ],
  controllers: [EtablissementsController, AdminEtablissementsController],
  providers: [EtablissementsService, AdminEtablissementsService, RolesGuard],
})
export class EtablissementsModule {}
