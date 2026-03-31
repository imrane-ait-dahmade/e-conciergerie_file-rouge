import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomaineModule } from '../domaines/domaine.module';
import { EtablissementsModule } from '../etablissements/etablissements.module';
import { Domaine, DomaineSchema } from '../domaines/schemas/domaine.schema';
import {
  Etablissement,
  EtablissementSchema,
} from '../etablissements/schemas/etablissement.schema';
import {
  EtablissementService,
  EtablissementServiceSchema,
} from '../etablissement-services/schemas/etablissement-service.schema';
import { Media, MediaSchema } from '../media/schemas/media.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { SliderModule } from '../sliders/slider.module';
import { MobileController } from './mobile.controller';
import { MobileDomainDetailsService } from './services/mobile-domain-details.service';
import { MobileNearbyEstablishmentServicesService } from './services/mobile-nearby-establishment-services.service';

@Module({
  imports: [
    EtablissementsModule,
    DomaineModule,
    SliderModule,
    MongooseModule.forFeature([
      { name: EtablissementService.name, schema: EtablissementServiceSchema },
      { name: Etablissement.name, schema: EtablissementSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Domaine.name, schema: DomaineSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
  controllers: [MobileController],
  providers: [MobileNearbyEstablishmentServicesService, MobileDomainDetailsService],
  exports: [MobileNearbyEstablishmentServicesService, MobileDomainDetailsService],
})
export class MobileModule {}
