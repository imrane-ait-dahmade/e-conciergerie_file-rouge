/**
 * Module Établissements - CRUD simple.
 * POST / PUT / DELETE protégés par JWT.
 * GET tous et GET par id = publics.
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Etablissement, EtablissementSchema } from './schemas/etablissement.schema';
import { EtablissementsController } from './etablissements.controller';
import { EtablissementsService } from './etablissements.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Etablissement.name, schema: EtablissementSchema },
    ]),
  ],
  controllers: [EtablissementsController],
  providers: [EtablissementsService],
})
export class EtablissementsModule {}
