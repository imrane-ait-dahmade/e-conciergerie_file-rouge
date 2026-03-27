import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomaineModule } from '../domaines/domaine.module';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { Service, ServiceSchema } from './schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
    ]),
    DomaineModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
