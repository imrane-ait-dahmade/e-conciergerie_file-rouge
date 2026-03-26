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
import { CreatePaysDto } from './dto/create-pays.dto';
import { UpdatePaysDto } from './dto/update-pays.dto';
import { PaysService } from './pays.service';

@ApiTags('Pays')
@Controller('pays')
export class PaysController {
  constructor(private readonly paysService: PaysService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un pays' })
  create(@Body() dto: CreatePaysDto) {
    return this.paysService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les pays' })
  findAll() {
    return this.paysService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un pays' })
  findOne(@Param('id') id: string) {
    return this.paysService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un pays' })
  update(@Param('id') id: string, @Body() dto: UpdatePaysDto) {
    return this.paysService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un pays' })
  remove(@Param('id') id: string) {
    return this.paysService.delete(id);
  }
}
