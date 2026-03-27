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
import { CreateQuartierDto } from './dto/create-quartier.dto';
import { ListQuartiersQueryDto } from './dto/list-quartiers-query.dto';
import { UpdateQuartierDto } from './dto/update-quartier.dto';
import { QuartiersService } from './quartiers.service';

@ApiTags('Quartiers')
@Controller(['quartiers', 'districts'])
export class QuartiersController {
  constructor(private readonly quartiersService: QuartiersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un quartier' })
  create(@Body() dto: CreateQuartierDto) {
    return this.quartiersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les quartiers (paginé ; filtre optionnel ?cityId=)',
  })
  findAll(@Query() query: ListQuartiersQueryDto) {
    return this.quartiersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un quartier' })
  findOne(@Param('id') id: string) {
    return this.quartiersService.findOne(id);
  }

  @Put(':id')
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un quartier (PUT ou PATCH)' })
  update(@Param('id') id: string, @Body() dto: UpdateQuartierDto) {
    return this.quartiersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un quartier' })
  remove(@Param('id') id: string) {
    return this.quartiersService.delete(id);
  }
}
