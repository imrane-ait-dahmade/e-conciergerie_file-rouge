import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { CaracteristiqueController } from './caracteristique.controller';
import { CaracteristiqueService } from './caracteristique.service';
import {
  Caracteristique,
  CaracteristiqueSchema,
} from './schemas/caracteristique.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Caracteristique.name, schema: CaracteristiqueSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
    ]),
  ],
  controllers: [CaracteristiqueController],
  providers: [CaracteristiqueService],
  exports: [CaracteristiqueService],
})
export class CaracteristiqueModule {}
