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
import { CreateQuartierDto } from './dto/create-quartier.dto';
import { UpdateQuartierDto } from './dto/update-quartier.dto';
import { QuartiersService } from './quartiers.service';

@ApiTags('Quartiers')
@Controller('quartiers')
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
  @ApiOperation({ summary: 'Lister les quartiers' })
  findAll() {
    return this.quartiersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un quartier' })
  findOne(@Param('id') id: string) {
    return this.quartiersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un quartier' })
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
