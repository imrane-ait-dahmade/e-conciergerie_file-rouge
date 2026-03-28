import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import { ProviderEtablissementsController } from './provider-etablissements.controller';
import { ProviderEtablissementsService } from './provider-etablissements.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [ProviderEtablissementsController],
  providers: [ProviderEtablissementsService, RolesGuard],
})
export class ProviderEtablissementsModule {}
