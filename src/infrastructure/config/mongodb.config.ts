import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri: String(process.env.MONGODB_URI),
}));
