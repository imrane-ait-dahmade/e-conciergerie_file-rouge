import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { randomUUID } from 'crypto';

/**
 * Encapsule le client MinIO (SDK) : connexion, création du bucket au démarrage, putObject.
 * Appelé par UploadsService, pas directement par le contrôleur.
 */
@Injectable()
export class MinioService implements OnModuleInit {
  private client: Client;
  private bucket: string;
  /** Base publique pour construire une URL lisible (ex. http://localhost:9000). */
  private publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const useSsl =
      this.config.get<boolean>('minio.useSsl', { infer: true }) ?? false;

    this.client = new Client({
      endPoint: this.config.getOrThrow<string>('minio.endpoint'),
      port: this.config.get<number>('minio.port', { infer: true }),
      useSSL: useSsl,
      accessKey: this.config.getOrThrow<string>('minio.accessKey'),
      secretKey: this.config.getOrThrow<string>('minio.secretKey'),
    });

    this.bucket = this.config.getOrThrow<string>('minio.bucket');
    this.publicBaseUrl = this.config
      .getOrThrow<string>('minio.publicUrl')
      .replace(/\/$/, '');
  }

  /**
   * Au démarrage de l’app : crée le bucket s’il n’existe pas encore.
   * Évite une erreur obscure au premier upload si on a oublié de créer le bucket à la main.
   */
  async onModuleInit(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
    }
  }

  /**
   * Envoie un fichier binaire dans MinIO et renvoie les infos utiles pour le client.
   */
  async uploadBuffer(params: {
    buffer: Buffer;
    originalFileName: string;
    mimeType?: string;
  }): Promise<{
    fileName: string;
    bucket: string;
    objectKey: string;
    url: string;
  }> {
    const safeName = params.originalFileName.replace(/[^\w.\-]+/g, '_');
    const objectKey = `${randomUUID()}-${safeName}`;

    await this.client.putObject(
      this.bucket,
      objectKey,
      params.buffer,
      params.buffer.length,
      {
        'Content-Type': params.mimeType ?? 'application/octet-stream',
      },
    );

    // URL « logique » (path-style). Si le bucket est privé, le navigateur ne pourra pas GET sans policy ou URL présignée.
    const url = `${this.publicBaseUrl}/${this.bucket}/${objectKey}`;

    return {
      fileName: params.originalFileName,
      bucket: this.bucket,
      objectKey,
      url,
    };
  }
}
