import type { SafeUserResponse } from '../../users/utils/safe-user.types';

/**
 * Signup response: safe user + success message.
 */
export interface SignupResponseDto extends SafeUserResponse {
  message: string;
}
