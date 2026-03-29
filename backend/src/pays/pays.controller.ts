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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MediaService } from '../media/media.service';
import { CreatePaysDto } from './dto/create-pays.dto';
import { UpdatePaysDto } from './dto/update-pays.dto';
import { PaysService } from './pays.service';

@ApiTags('Pays')
@Controller(['pays', 'countries'])
export class PaysController {
  constructor(
    private readonly paysService: PaysService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un pays' })
  create(@Body() dto: CreatePaysDto) {
    return this.paysService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les pays (paginé : ?page=&limit=)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.paysService.findAll(query);
  }

  @Get(':id/media/primary')
  @ApiOperation({
    summary: 'Image principale du pays (isPrimary, ex. drapeau), ou null',
  })
  findCountryPrimaryMedia(@Param('id') id: string) {
    return this.mediaService.findPrimaryMediaForCountry(id);
  }

  @Get(':id/media')
  @ApiOperation({ summary: 'Images liées au pays (ex. drapeau)' })
  findCountryMedia(@Param('id') id: string) {
    return this.mediaService.findMediaForCountry(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un pays' })
  findOne(@Param('id') id: string) {
    return this.paysService.findOne(id);
  }

  @Put(':id')
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un pays (PUT ou PATCH)' })
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
