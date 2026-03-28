import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * Création d’une ligne « libellé + valeur » sur une offre (EtablissementService).
 *
 * - Soit vous choisissez une entrée du **catalogue** admin (`caracteristiqueCatalogId`) :
 *   le libellé est repris du catalogue (le document doit exister).
 * - Soit vous saisissez un **libellé libre** (`libelle`) + `valeur`.
 *
 * Le catalogue global `Caracteristique` n’est pas modifié — on ne fait qu’y faire référence
 * pour préremplir le libellé sur la ligne d’offre.
 */
export class CreateProviderEtablissementServiceCaracteristiqueDto {
  @IsOptional()
  @IsMongoId({ message: 'Identifiant caractéristique (catalogue) invalide' })
  caracteristiqueCatalogId?: string;

  @ValidateIf(
    (o: CreateProviderEtablissementServiceCaracteristiqueDto) =>
      !o.caracteristiqueCatalogId,
  )
  @IsNotEmpty({ message: 'Libellé requis si aucune caractéristique catalogue' })
  @IsString()
  @MaxLength(200)
  libelle?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  valeur: string;
}
