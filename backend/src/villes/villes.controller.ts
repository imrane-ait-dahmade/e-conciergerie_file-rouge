import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVilleDto } from './dto/create-ville.dto';
import { UpdateVilleDto } from './dto/update-ville.dto';
import { VillesService } from './villes.service';

@ApiTags('Villes')
@Controller('villes')
export class VillesController {
  constructor(private readonly villesService: VillesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une ville' })
  create(@Body() dto: CreateVilleDto) {
    return this.villesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les villes' })
  findAll() {
    return this.villesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une ville' })
  findOne(@Param('id') id: string) {
    return this.villesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une ville' })
  update(@Param('id') id: string, @Body() dto: UpdateVilleDto) {
    return this.villesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une ville' })
  remove(@Param('id') id: string) {
    return this.villesService.delete(id);
  }
}
