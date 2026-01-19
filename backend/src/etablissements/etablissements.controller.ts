/**
 * Contrôleur CRUD établissements.
 * POST / PUT / DELETE = protégés par JWT (req.user.userId = prestataire).
 * GET all et GET by id = publics.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EtablissementsService } from './etablissements.service';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';

@Controller('etablissements')
export class EtablissementsController {
  constructor(private readonly service: EtablissementsService) {}

  /** Créer : protégé. prestataire = utilisateur connecté. */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateEtablissementDto, @Req() req: { user: RequestUser }) {
    return this.service.create(dto, req.user.userId);
  }

  /** Liste : public. */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** Détail : public. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /** Mettre à jour : protégé. Propriétaire uniquement. */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEtablissementDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.service.update(id, dto, req.user.userId);
  }

  /** Supprimer : protégé. Propriétaire uniquement. */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @Req() req: { user: RequestUser }) {
    return this.service.delete(id, req.user.userId);
  }
}