import { HttpError } from './errors.js';
import { resolveSessionUser } from './session.js';

export function attachUser(req, res, next) {
  req.user = resolveSessionUser(req);
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) throw new HttpError(401, 'Sessão expirada. Faça login novamente.');
  next();
}

export function apiNotFound(req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

function publicMessage(error, status) {
  if (status >= 500) return 'Erro interno do servidor.';
  if (error.type === 'entity.parse.failed') return 'Requisição inválida.';
  return error.message;
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  const status = error.status ?? 500;
  if (status >= 500) console.error(error);

  res.status(status).json({ error: publicMessage(error, status) });
}
