import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateDomaineDto } from './dto/create-domaine.dto';
import { UpdateDomaineDto } from './dto/update-domaine.dto';
import { DomaineService } from './domaine.service';

@ApiTags('Domaines')
@Controller('domaines')
export class DomaineController {
  constructor(private readonly domaineService: DomaineService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un domaine' })
  create(@Body() dto: CreateDomaineDto) {
    return this.domaineService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les domaines' })
  findAll() {
    return this.domaineService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un domaine' })
  findOne(@Param('id') id: string) {
    return this.domaineService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un domaine' })
  update(@Param('id') id: string, @Body() dto: UpdateDomaineDto) {
    return this.domaineService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un domaine' })
  remove(@Param('id') id: string) {
    return this.domaineService.remove(id);
  }
}
