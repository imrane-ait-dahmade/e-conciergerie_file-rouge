import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * Activation / désactivation explicite (PATCH /users/:id/status).
 */
export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
