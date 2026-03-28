import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/** Mise à jour du profil par l’utilisateur connecté (pas de mot de passe ici). */
export class UpdateOwnProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  prenom?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  telephone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adresse?: string;
}
