import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MapNearbyQueryDto } from './dto/map-nearby-query.dto';
import { MapNearbyService } from './map-nearby.service';

@ApiTags('Map')
@Controller('map')
export class MapController {
  constructor(private readonly mapNearby: MapNearbyService) {}

  @Get('nearby')
  @ApiOperation({
    summary: 'Offres à proximité pour la carte mobile (points + métadonnées légères)',
  })
  nearby(@Query() query: MapNearbyQueryDto) {
    return this.mapNearby.findNearby(query);
  }
}
