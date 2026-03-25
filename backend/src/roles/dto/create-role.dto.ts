import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Création d’un rôle (usage interne / admin).
 * Les rôles standards sont créés par le seed ; ce DTO sert si vous ajoutez des rôles plus tard.
 */
export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-z][a-z0-9_-]*$/, {
    message: 'name doit être en minuscules (ex: admin, prestataire)',
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  label?: string;
}
