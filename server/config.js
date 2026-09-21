import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 3000,
  isProduction: process.env.NODE_ENV === 'production',
  trustProxy: process.env.TRUST_PROXY === '1',
  dbPath: process.env.DB_PATH ?? path.join(ROOT_DIR, 'data', 'caixa.db'),
  publicDir: path.join(ROOT_DIR, 'public'),
  sessionTtlMs: 7 * 24 * 60 * 60 * 1000,
};
