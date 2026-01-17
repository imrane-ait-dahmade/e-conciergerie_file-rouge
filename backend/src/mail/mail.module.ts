import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { ConsoleMailAdapter } from './adapters/console-mail.adapter';
import { MAIL_ADAPTER } from './mail.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: MAIL_ADAPTER,
      useClass: ConsoleMailAdapter,
      // Swap to NodemailerMailAdapter, ResendMailAdapter, etc. for production
    },
  ],
  exports: [MailService],
})
export class MailModule {}
