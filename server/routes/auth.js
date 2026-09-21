import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../errors.js';
import { requireAuth } from '../middleware.js';
import { hashPassword, verifyPassword } from '../passwords.js';
import { createUser, findUserByEmail } from '../repositories/users.js';
import { endSession, startSession } from '../session.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

const toPublicUser = ({ id, email }) => ({ id, email });

function parseCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    throw new HttpError(400, 'Informe um e-mail válido.');
  }
  if (password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    throw new HttpError(400, 'Informe a senha.');
  }

  return { email, password };
}

const router = Router();

router.post('/register', credentialsLimiter, async (req, res) => {
  const { email, password } = parseCredentials(req.body);

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  let user;
  try {
    user = createUser(email, await hashPassword(password));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new HttpError(409, 'E-mail já cadastrado.');
    throw error;
  }

  startSession(res, user.id);
  res.status(201).json({ user: toPublicUser(user) });
});

router.post('/login', credentialsLimiter, async (req, res) => {
  const { email, password } = parseCredentials(req.body);

  const user = findUserByEmail(email);
  const isValid = user && (await verifyPassword(password, user.password_hash));
  if (!isValid) throw new HttpError(401, 'E-mail ou senha inválidos.');

  startSession(res, user.id);
  res.json({ user: toPublicUser(user) });
});

router.post('/logout', (req, res) => {
  endSession(req, res);
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

export default router;
