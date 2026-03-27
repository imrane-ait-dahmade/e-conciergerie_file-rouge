import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  /** POST /uploads/single — body: multipart/form-data, champ fichier = "file" */
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async single(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file?.buffer) {
      throw new BadRequestException('Missing file field "file".');
    }
    return this.uploads.uploadFile(file);
  }
}
