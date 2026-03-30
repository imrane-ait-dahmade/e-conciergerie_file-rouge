import { Module } from '@nestjs/common';
import { ServiceModule } from '../services/service.module';
import { MapController } from './map.controller';
import { MapNearbyService } from './map-nearby.service';

@Module({
  imports: [ServiceModule],
  controllers: [MapController],
  providers: [MapNearbyService],
})
export class MapModule {}
