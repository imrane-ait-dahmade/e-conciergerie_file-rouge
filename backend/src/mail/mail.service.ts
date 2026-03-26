import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAIL_ADAPTER } from './mail.constants';
import type { IMailAdapter } from './interfaces/mail-adapter.interface';
import {
  buildVerificationEmailHtml,
  buildResetPasswordEmailHtml,
} from './templates/auth-templates';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_ADAPTER) private readonly adapter: IMailAdapter,
    private readonly config: ConfigService,
  ) {}

  /** Base URL of the frontend app. */
  private get frontendUrl(): string {
    return this.config.get<string>('frontend.url') ?? 'http://localhost:3000';
  }

  /**
   * Sends email verification link to the user.
   * Link format: {FRONTEND_URL}/verify-email?token={token}
   */
  async sendVerificationEmail(
    email: string,
    prenom: string,
    token: string,
  ): Promise<void> {
    const verificationLink = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const html = buildVerificationEmailHtml(prenom, verificationLink);

    await this.adapter.send({
      to: email,
      from: this.config.get('mail.from'),
      subject: 'Vérifiez votre adresse email',
      html,
    });
  }

  /**
   * Sends password reset link to the user.
   * Link format: {FRONTEND_URL}/reset-password?token={token}
   */
  async sendResetPasswordEmail(
    email: string,
    prenom: string,
    token: string,
  ): Promise<void> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const html = buildResetPasswordEmailHtml(prenom, resetLink);

    await this.adapter.send({
      to: email,
      from: this.config.get('mail.from'),
      subject: 'Réinitialisation de votre mot de passe',
      html,
    });
  }
}
