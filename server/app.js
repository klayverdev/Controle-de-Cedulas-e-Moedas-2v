import cookieParser from 'cookie-parser';
import express from 'express';
import { config } from './config.js';
import { apiNotFound, attachUser, errorHandler, requireAuth } from './middleware.js';
import authRoutes from './routes/auth.js';
import operationsRoutes from './routes/operations.js';
import pagesRoutes from './routes/pages.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api', attachUser);
  app.use('/api/auth', authRoutes);
  app.use('/api/operations', requireAuth, operationsRoutes);
  app.use('/api', apiNotFound);

  app.use(pagesRoutes);
  app.use(express.static(config.publicDir, { index: false }));

  app.use(errorHandler);
  return app;
}
