import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerService {
  private readonly logger = new Logger(NodemailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('nodemailer.host'),
      port: this.configService.get('nodemailer.port'),
      secure: this.configService.get('nodemailer.secure'),
      auth: {
        user: this.configService.get('nodemailer.auth.user'),
        pass: this.configService.get('nodemailer.auth.pass'),
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get('nodemailer.auth.user'),
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendDummyMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    this.logger.log(`
      Dummy email sent:
      To: ${to}
      Subject: ${subject}
      Text: ${text}
      HTML: ${html || 'No HTML content'}
    `);

    return { messageId: `<dummy-${Date.now()}@example.com>` };
  }
}
