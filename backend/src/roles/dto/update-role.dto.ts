import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

/** Mise à jour partielle d’un rôle (ex. libellé). */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
