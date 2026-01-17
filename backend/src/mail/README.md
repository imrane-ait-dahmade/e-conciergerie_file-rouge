# MailModule

Reusable mail abstraction for authentication emails. Easy to swap transports (Console, Nodemailer, Resend, SendGrid, Mailtrap).

## Structure

```
mail/
├── mail.module.ts
├── mail.service.ts
├── mail.constants.ts
├── interfaces/
│   └── mail-adapter.interface.ts   # Transport contract
├── adapters/
│   └── console-mail.adapter.ts    # Dev: logs to console
└── templates/
    └── auth-templates.ts          # HTML templates
```

## Environment

| Variable       | Description                                   | Default            |
|----------------|-----------------------------------------------|--------------------|
| `FRONTEND_URL` | Base URL for verification/reset links         | `http://localhost:3000` |

## AuthService Integration

**1. Import MailModule in AuthModule**

```typescript
// auth.module.ts
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UsersModule, MailModule],
  // ...
})
export class AuthModule {}
```

**2. Inject MailService in AuthService**

```typescript
// auth.service.ts
constructor(
  @InjectModel(User.name) private readonly userModel: Model<User>,
  private readonly mailService: MailService,
) {}
```

**3. Call after successful signup**

```typescript
// After user is created, send verification email (non-blocking)
this.mailService.sendVerificationEmail(email, dto.prenom.trim(), emailVerificationToken)
  .catch((err) => this.logger.warn(`Verification email failed for ${email}`, err));
```

**4. For password reset flow**

```typescript
// After generating passwordResetToken
await this.mailService.sendResetPasswordEmail(email, prenom, passwordResetToken);
```

## Swapping the Transport

Replace `ConsoleMailAdapter` in `mail.module.ts`:

```typescript
// mail.module.ts
{
  provide: MAIL_ADAPTER,
  useClass: NodemailerMailAdapter,  // or ResendMailAdapter, etc.
}
```

Create a new adapter implementing `IMailAdapter`:

```typescript
// adapters/nodemailer-mail.adapter.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { IMailAdapter, SendMailOptions } from '../interfaces/mail-adapter.interface';

@Injectable()
export class NodemailerMailAdapter implements IMailAdapter {
  private transporter = nodemailer.createTransport(/* SMTP config */);

  async send(options: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      from: options.from ?? 'noreply@example.com',
    });
  }
}
```
