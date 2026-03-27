import { PartialType } from '@nestjs/swagger';
import { CreateCaracteristiqueDto } from './create-caracteristique.dto';

/** Mise à jour partielle : tous les champs optionnels. */
export class UpdateCaracteristiqueDto extends PartialType(
  CreateCaracteristiqueDto,
) {}
