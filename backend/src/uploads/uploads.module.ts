import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { MinioService } from './minio.service';

/**
 * Module uploads : contrôleur (HTTP) → service uploads (règles) → service MinIO (stockage).
 */
@Module({
  controllers: [UploadsController],
  providers: [UploadsService, MinioService],
  exports: [UploadsService, MinioService],
})
export class UploadsModule {}
