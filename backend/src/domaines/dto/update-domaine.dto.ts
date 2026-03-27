import { PartialType } from '@nestjs/swagger';
import { CreateDomaineDto } from './create-domaine.dto';

/** Mise à jour partielle : champs optionnels. */
export class UpdateDomaineDto extends PartialType(CreateDomaineDto) {}
