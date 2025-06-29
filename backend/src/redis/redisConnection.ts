import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_TLS } from '../config/config';

export const redisClient = new Redis({
  host: REDIS_HOST || '',
  port: REDIS_PORT ? Number(REDIS_PORT) : undefined,
  password: REDIS_PASSWORD,
  tls: REDIS_TLS ? {} : undefined, // Set to an object if TLS is enabled, otherwise undefined
});
