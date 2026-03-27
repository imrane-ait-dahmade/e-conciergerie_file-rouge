import { BadRequestException, Injectable } from '@nestjs/common';
import { MinioService } from './minio.service';

/** Réponse renvoyée au client après un upload réussi. */
export type SingleUploadResult = {
  fileName: string;
  bucket: string;
  objectKey: string;
  url: string;
};

/**
 * Logique métier des uploads : vérifie le fichier Multer puis délègue le stockage à MinIO.
 * Le contrôleur reste mince (HTTP seulement).
 */
@Injectable()
export class UploadsService {
  constructor(private readonly minioService: MinioService) {}

  async saveSingleFile(
    file: Express.Multer.File | undefined,
  ): Promise<SingleUploadResult> {
    if (!file?.buffer) {
      throw new BadRequestException(
        'Aucun fichier reçu. Envoie un champ multipart nommé exactement "file".',
      );
    }

    return this.minioService.uploadBuffer({
      buffer: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
    });
  }
}
