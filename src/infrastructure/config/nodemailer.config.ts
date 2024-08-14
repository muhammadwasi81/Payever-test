import { registerAs } from '@nestjs/config';

export default registerAs('nodemailer', () => ({
  host: process.env.MAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.MAIL_PORT, 10) || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER || 'user@example.com',
    pass: process.env.MAIL_PASSWORD || 'password',
  },
}));
