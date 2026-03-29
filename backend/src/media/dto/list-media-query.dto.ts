import { IsMongoId, IsOptional } from 'class-validator';

/** Filtres optionnels pour GET /media (toujours limité au prestataire connecté). */
export class ListMediaQueryDto {
  @IsOptional()
  @IsMongoId()
  etablissementId?: string;

  @IsOptional()
  @IsMongoId()
  etablissementServiceId?: string;
}
