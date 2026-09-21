import { createApp } from './app.js';
import { config } from './config.js';
import { purgeExpiredSessions } from './repositories/sessions.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

purgeExpiredSessions();
setInterval(purgeExpiredSessions, ONE_HOUR_MS).unref();

createApp().listen(config.port, () => {
  console.log(`Contador de Caixa em http://localhost:${config.port}`);
});
