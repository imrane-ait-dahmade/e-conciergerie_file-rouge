import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * Activation / désactivation explicite (PATCH …/status).
 */
export class UpdateEtablissementStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
