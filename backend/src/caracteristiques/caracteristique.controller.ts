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
import { CaracteristiqueService } from './caracteristique.service';
import { CreateCaracteristiqueDto } from './dto/create-caracteristique.dto';
import { UpdateCaracteristiqueDto } from './dto/update-caracteristique.dto';

@ApiTags('Caractéristiques')
@Controller('caracteristiques')
export class CaracteristiqueController {
  constructor(
    private readonly caracteristiqueService: CaracteristiqueService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une caractéristique' })
  create(@Body() dto: CreateCaracteristiqueDto) {
    return this.caracteristiqueService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les caractéristiques (service + établissement peuplés)' })
  findAll() {
    return this.caracteristiqueService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une caractéristique' })
  findOne(@Param('id') id: string) {
    return this.caracteristiqueService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une caractéristique' })
  update(@Param('id') id: string, @Body() dto: UpdateCaracteristiqueDto) {
    return this.caracteristiqueService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une caractéristique' })
  remove(@Param('id') id: string) {
    return this.caracteristiqueService.remove(id);
  }
}
