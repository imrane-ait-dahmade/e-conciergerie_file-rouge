import type { SafeUserResponse } from '../../users/utils/safe-user.types';

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: SafeUserResponse;
}
