import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AdminOrPrestataire } from '../auth/decorators/admin-or-prestataire.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListMediaQueryDto } from './dto/list-media-query.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';

const MAX_BYTES = 100 * 1024 * 1024;
const MAX_BATCH_FILES = 15;

/**
 * Gestion des médias (MinIO + MongoDB).
 * JWT **admin** ou **prestataire** ; les listes / droits sur une ligne restent liés à `prestataire` en base.
 */
@ApiTags('Media')
@ApiBearerAuth()
@AdminOrPrestataire()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /** Déclaré avant POST upload pour éviter toute ambiguïté de chemin. */
  @Post('upload/batch')
  @ApiOperation({
    summary:
      'Uploader plusieurs fichiers (même parent). isPrimary → première image du lot',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        etablissementId: { type: 'string' },
        etablissementServiceId: { type: 'string' },
        entityType: { type: 'string', enum: ['city', 'country'] },
        entityId: { type: 'string', description: 'Mongo id ville ou pays' },
        isPrimary: {
          type: 'boolean',
          description: 'Première image du lot = principale',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', MAX_BATCH_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES },
    }),
  )
  uploadBatch(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() body: UploadMediaDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.mediaService.uploadBatch(files, body, userId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Uploader une image ou une vidéo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        etablissementId: {
          type: 'string',
          description: 'ID établissement (xor etablissementServiceId)',
        },
        etablissementServiceId: {
          type: 'string',
          description: 'ID ligne etablissement_service (xor etablissementId)',
        },
        entityType: {
          type: 'string',
          enum: ['city', 'country'],
          description: 'Xor avec etablissement* : cible référentiel géo',
        },
        entityId: {
          type: 'string',
          description: 'ID Mongo ville (entityType=city) ou pays (country)',
        },
        isPrimary: {
          type: 'boolean',
          description: 'Image principale (images uniquement)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadMediaDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.mediaService.upload(file, body, userId);
  }

  @Get()
  @ApiOperation({
    summary:
      'Lister mes médias (filtres optionnels par établissement ou ligne service)',
  })
  findAll(
    @Query() query: ListMediaQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.mediaService.findAll(userId, query);
  }

  @Patch(':id/primary')
  @ApiOperation({
    summary:
      'Image principale : un seul isPrimary par entité (établissement, ville, pays, ligne service). Les autres passent à false.',
  })
  setPrimary(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.mediaService.setPrimary(id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un média' })
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.mediaService.findOne(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un média (MinIO + base)' })
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.mediaService.remove(id, userId);
  }
}
