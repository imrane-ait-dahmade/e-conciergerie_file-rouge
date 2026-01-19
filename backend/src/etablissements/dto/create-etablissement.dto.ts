import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO pour la création d'un établissement.
 * prestataire est défini côté serveur à partir de l'utilisateur connecté.
 */
export class CreateEtablissementDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  @MaxLength(200)
  nom: string;

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
