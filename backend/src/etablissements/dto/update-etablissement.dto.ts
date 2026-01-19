import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO pour la mise à jour d'un établissement.
 * Tous les champs sont optionnels (mise à jour partielle).
 * prestataire ne peut pas être modifié.
 */
export class UpdateEtablissementDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @IsOptional()
  @IsEmail({}, { message: "L'email doit être valide" })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;
}
