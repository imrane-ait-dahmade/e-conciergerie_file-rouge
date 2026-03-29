import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { randomUUID } from 'crypto';

/** Réponse renvoyée au client après un upload réussi. */
export type UploadResult = {
  bucket: string;
  key: string;
  originalName: string;
  size: number;
};

/**
 * Un seul service : lit la config, parle à MinIO, envoie le fichier.
 */
@Injectable()
export class UploadsService {
  private readonly minio: Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment -- ConfigService keys validated by Joi */
    const ssl =
      this.config.get<boolean>('minio.useSsl', { infer: true }) ?? false;
    this.minio = new Client({
      endPoint: this.config.getOrThrow<string>('minio.endpoint'),
      port: this.config.get<number>('minio.port', { infer: true }),
      useSSL: ssl,
      accessKey: this.config.getOrThrow<string>('minio.accessKey'),
      secretKey: this.config.getOrThrow<string>('minio.secretKey'),
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    this.bucket = this.config.getOrThrow<string>('minio.bucket');
  }

  /** Envoie le fichier Multer vers MinIO et renvoie quelques infos utiles. */
  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket, 'us-east-1');
    }

    const safe = file.originalname.replace(/[^\w.-]+/g, '_') || 'file';
    const key = `${randomUUID()}-${safe}`;
    const size = file.size ?? file.buffer.length;

    await this.minio.putObject(this.bucket, key, file.buffer, size, {
      'Content-Type': file.mimetype || 'application/octet-stream',
    });

    return {
      bucket: this.bucket,
      key,
      originalName: file.originalname,
      size,
    };
  }

  /**
   * Envoie le fichier sous une clé imposée (ex. préfixe par prestataire / UUID).
   */
  async uploadFileWithKey(
    file: Express.Multer.File,
    objectKey: string,
  ): Promise<UploadResult> {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket, 'us-east-1');
    }

    const size = file.size ?? file.buffer.length;
    await this.minio.putObject(this.bucket, objectKey, file.buffer, size, {
      'Content-Type': file.mimetype || 'application/octet-stream',
    });

    return {
      bucket: this.bucket,
      key: objectKey,
      originalName: file.originalname,
      size,
    };
  }

  /** Supprime un objet dans le bucket configuré. */
  async removeObject(objectKey: string): Promise<void> {
    await this.minio.removeObject(this.bucket, objectKey);
  }
}
