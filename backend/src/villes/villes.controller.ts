import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVilleDto } from './dto/create-ville.dto';
import { ListVillesQueryDto } from './dto/list-villes-query.dto';
import { UpdateVilleDto } from './dto/update-ville.dto';
import { VillesService } from './villes.service';

@ApiTags('Villes')
@Controller(['villes', 'cities'])
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
  @ApiOperation({ summary: 'Lister les villes (paginé ; filtre optionnel ?countryId=)' })
  findAll(@Query() query: ListVillesQueryDto) {
    return this.villesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une ville' })
  findOne(@Param('id') id: string) {
    return this.villesService.findOne(id);
  }

  @Put(':id')
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une ville (PUT ou PATCH)' })
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
