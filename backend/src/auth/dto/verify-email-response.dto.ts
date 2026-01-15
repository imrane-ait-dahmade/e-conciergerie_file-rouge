/**
 * Safe response after successful email verification.
 */
export interface VerifyEmailResponseDto {
  message: string;
  emailVerified: boolean;
}
