import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { CreateEtablissementServiceDto } from './dto/create-etablissement-service.dto';
import { ListEtablissementServicesQueryDto } from './dto/list-etablissement-services-query.dto';
import { UpdateEtablissementServiceDto } from './dto/update-etablissement-service.dto';
import { EtablissementServicesService } from './etablissement-services.service';

/**
 * Gestion des assignations « établissement ↔ service catalogue ».
 * Distinct du CRUD `/services` (référentiel des types de prestation).
 */
@ApiTags('Etablissement-services (admin)')
@ApiBearerAuth()
@AdminOnly()
@Controller('etablissement-services')
export class EtablissementServicesController {
  constructor(
    private readonly etablissementServicesService: EtablissementServicesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assigner un service du catalogue à un établissement' })
  create(@Body() dto: CreateEtablissementServiceDto) {
    return this.etablissementServicesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les assignations (paginé ; ?etablissementId= pour filtrer)',
  })
  findAll(@Query() query: ListEtablissementServicesQueryDto) {
    return this.etablissementServicesService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une assignation' })
  findOne(@Param('id') id: string) {
    return this.etablissementServicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour prix / commentaire sur la liaison' })
  update(@Param('id') id: string, @Body() dto: UpdateEtablissementServiceDto) {
    return this.etablissementServicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Retirer le service de l’établissement' })
  remove(@Param('id') id: string) {
    return this.etablissementServicesService.remove(id);
  }
}
