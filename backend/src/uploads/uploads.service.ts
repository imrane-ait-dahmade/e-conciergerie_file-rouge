import { BadGatewayException, Injectable } from '@nestjs/common';
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

function s3ErrorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    return String((err as { code: unknown }).code);
  }
  return '';
}

function isNoSuchBucketError(err: unknown): boolean {
  const code = s3ErrorCode(err);
  return code === 'NoSuchBucket' || code === 'NotFound';
}

/** Transforme les erreurs MinIO réseau / 503 en message exploitable côté client. */
function rethrowIfStorageUnavailable(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg.includes('503') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Retryable HTTP status')
  ) {
    throw new BadGatewayException(
      'Stockage fichiers (MinIO) indisponible ou mal configuré. ' +
        'En local : `docker compose up -d` à la racine du projet, puis vérifiez MINIO_ENDPOINT / MINIO_PORT ' +
        'et que MINIO_ACCESS_KEY et MINIO_SECRET_KEY correspondent au serveur (ex. minioadmin / minioadmin avec le docker-compose du repo).',
    );
  }
  throw err;
}

/**
 * Un seul service : lit la config, parle à MinIO, envoie le fichier.
 */
@Injectable()
export class UploadsService {
  private readonly minio: Client;
  private readonly bucket: string;
  private readonly bucketRegion: string;

  constructor(private readonly config: ConfigService) {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment -- ConfigService keys validated by Joi */
    const ssl =
      this.config.get<boolean>('minio.useSsl', { infer: true }) ?? false;
    this.bucketRegion =
      this.config.get<string>('minio.region', { infer: true }) ?? 'us-east-1';
    this.minio = new Client({
      endPoint: this.config.getOrThrow<string>('minio.endpoint'),
      port: this.config.get<number>('minio.port', { infer: true }),
      useSSL: ssl,
      accessKey: this.config.getOrThrow<string>('minio.accessKey'),
      secretKey: this.config.getOrThrow<string>('minio.secretKey'),
      region: this.bucketRegion,
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    this.bucket = this.config.getOrThrow<string>('minio.bucket');
  }

  /**
   * Envoie l’objet sans appeler `makeBucket` d’abord : si le bucket existe déjà
   * (cas le plus courant), un seul PUT suffit. Certains environnements renvoient 503
   * sur `makeBucket` même quand le stockage est opérationnel.
   * Si le bucket n’existe pas → erreur NoSuchBucket → `makeBucket` puis retry.
   */
  private async putObjectOnce(
    key: string,
    body: Buffer,
    size: number,
    meta: Record<string, string>,
  ): Promise<void> {
    try {
      await this.minio.putObject(this.bucket, key, body, size, meta);
    } catch (err: unknown) {
      if (!isNoSuchBucketError(err)) {
        rethrowIfStorageUnavailable(err);
      }
      try {
        await this.minio.makeBucket(this.bucket, this.bucketRegion);
      } catch (mbErr: unknown) {
        const c = s3ErrorCode(mbErr);
        if (c !== 'BucketAlreadyOwnedByYou' && c !== 'BucketAlreadyExists') {
          rethrowIfStorageUnavailable(mbErr);
        }
      }
      try {
        await this.minio.putObject(this.bucket, key, body, size, meta);
      } catch (err2: unknown) {
        rethrowIfStorageUnavailable(err2);
      }
    }
  }

  /** Envoie le fichier Multer vers MinIO et renvoie quelques infos utiles. */
  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    const safe = file.originalname.replace(/[^\w.-]+/g, '_') || 'file';
    const key = `${randomUUID()}-${safe}`;
    const size = file.size ?? file.buffer.length;

    await this.putObjectOnce(key, file.buffer, size, {
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
    const size = file.size ?? file.buffer.length;
    await this.putObjectOnce(objectKey, file.buffer, size, {
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
