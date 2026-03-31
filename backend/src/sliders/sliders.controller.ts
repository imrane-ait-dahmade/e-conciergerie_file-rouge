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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { ListSlidersQueryRequest } from './requests/list-sliders-query.request';
import { StoreSliderRequest } from './requests/store-slider.request';
import { UpdateSliderRequest } from './requests/update-slider.request';
import { SliderService } from './slider.service';

/**
 * CRUD admin des sliders (carrousel d’accueil).
 *
 * Autorisation : équivalent d’une Policy Laravel « only admin » — JWT + rôle `admin` via \@AdminOnly().
 */
@ApiTags('Sliders (admin)')
@ApiBearerAuth()
@AdminOnly()
@Controller('sliders')
export class SlidersController {
  constructor(private readonly sliderService: SliderService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les sliders (paginé, filtres is_active et recherche titre)',
  })
  findAll(@Query() query: ListSlidersQueryRequest) {
    return this.sliderService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un slider' })
  findOne(@Param('id') id: string) {
    return this.sliderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un slider' })
  create(@Body() dto: StoreSliderRequest) {
    return this.sliderService.create(dto);
  }

  @Put(':id')
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un slider (PUT ou PATCH)' })
  update(@Param('id') id: string, @Body() dto: UpdateSliderRequest) {
    return this.sliderService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un slider' })
  remove(@Param('id') id: string) {
    return this.sliderService.remove(id);
  }
}
