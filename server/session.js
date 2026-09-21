import { createHash, randomBytes } from 'node:crypto';
import { config } from './config.js';
import { findUserBySession, removeSession, saveSession } from './repositories/sessions.js';

const COOKIE_NAME = 'sid';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.isProduction,
};

export function startSession(res, userId) {
  const token = randomBytes(32).toString('base64url');
  saveSession(hashToken(token), userId, Date.now() + config.sessionTtlMs);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: config.sessionTtlMs });
}

export function endSession(req, res) {
  const token = req.cookies[COOKIE_NAME];
  if (token) removeSession(hashToken(token));
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export function resolveSessionUser(req) {
  const token = req.cookies[COOKIE_NAME];
  return (token && findUserBySession(hashToken(token))) || null;
}
