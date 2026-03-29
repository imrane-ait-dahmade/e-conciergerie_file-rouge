import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaService } from '../media/media.service';

/**
 * Route publique : médias d’une ligne établissement ↔ service.
 * Séparé du contrôleur admin `EtablissementServicesController` (pas de garde JWT ici).
 */
@ApiTags('Etablissement-services')
@Controller('etablissement-services')
export class EtablissementServicesMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id/media')
  @ApiOperation({
    summary: 'Lister les médias liés à cette assignation établissement / service',
  })
  findMedia(@Param('id') id: string) {
    return this.mediaService.findMediaForEtablissementService(id);
  }
}
