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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServicesNearbyQueryDto } from './dto/services-nearby-query.dto';
import { ServicesSearchQueryDto } from './dto/services-search-query.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceService } from './service.service';
import { ServicesNearbyService } from './services-nearby.service';
import { ServicesSearchService } from './services-search.service';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly servicesNearbyService: ServicesNearbyService,
    private readonly servicesSearchService: ServicesSearchService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un service' })
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les services (domaine + établissement peuplés)' })
  findAll() {
    return this.serviceService.findAll();
  }

  @Get('nearby')
  @ApiOperation({
    summary:
      'Offres à proximité (établissement × service actifs, tri par distance)',
  })
  findNearby(@Query() query: ServicesNearbyQueryDto) {
    return this.servicesNearbyService.findAll(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Recherche de services actifs avec filtres (MVP mobile)',
  })
  search(@Query() query: ServicesSearchQueryDto) {
    return this.servicesSearchService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un service' })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un service' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.serviceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un service' })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
