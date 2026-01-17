import { Injectable } from '@nestjs/common';
import type { IMailAdapter, SendMailOptions } from '../interfaces/mail-adapter.interface';

/**
 * Logs emails to console. Use for development or until a real provider is configured.
 * Replace with NodemailerMailAdapter, ResendMailAdapter, etc. in production.
 */
@Injectable()
export class ConsoleMailAdapter implements IMailAdapter {
  async send(options: SendMailOptions): Promise<void> {
    console.log('[Mail]', {
      to: options.to,
      subject: options.subject,
      htmlPreview: options.html?.slice(0, 80) + '...',
      timestamp: new Date().toISOString(),
    });
  }
}
