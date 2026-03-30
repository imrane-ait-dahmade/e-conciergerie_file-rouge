import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomaineModule } from '../domaines/domaine.module';
import { Domaine, DomaineSchema } from '../domaines/schemas/domaine.schema';
import { EtablissementService, EtablissementServiceSchema } from '../etablissement-services/schemas/etablissement-service.schema';
import { Etablissement, EtablissementSchema } from '../etablissements/schemas/etablissement.schema';
import { Media, MediaSchema } from '../media/schemas/media.schema';
import { MobileModule } from '../mobile/mobile.module';
import { Ville, VilleSchema } from '../villes/schemas/ville.schema';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ServicesNearbyService } from './services-nearby.service';
import { ServicesSearchService } from './services-search.service';
import { Service, ServiceSchema } from './schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: Domaine.name, schema: DomaineSchema },
      { name: Ville.name, schema: VilleSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
    DomaineModule,
    MobileModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService, ServicesNearbyService, ServicesSearchService],
  exports: [ServiceService, ServicesNearbyService],
})
export class ServiceModule {}
