import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

/** Tous les champs optionnels pour PATCH. */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
