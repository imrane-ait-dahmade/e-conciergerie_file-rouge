/**
 * Transport abstraction for sending emails.
 * Implement this interface to swap between Nodemailer, Resend, SendGrid, Mailtrap, etc.
 */
export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface IMailAdapter {
  send(options: SendMailOptions): Promise<void>;
}
