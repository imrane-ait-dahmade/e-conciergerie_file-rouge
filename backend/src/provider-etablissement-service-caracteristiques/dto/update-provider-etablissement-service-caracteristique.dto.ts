import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Mise à jour des champs métier sur la ligne (pas de changement d’offre / d’établissement).
 */
export class UpdateProviderEtablissementServiceCaracteristiqueDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  libelle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  valeur?: string;
}
