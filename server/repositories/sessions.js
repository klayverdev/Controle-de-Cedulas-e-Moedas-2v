import { db } from '../db.js';

const insertSession = db.prepare(
  'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
);
const selectUserByToken = db.prepare(`
  SELECT users.id, users.email
  FROM sessions
  JOIN users ON users.id = sessions.user_id
  WHERE sessions.token_hash = ? AND sessions.expires_at > ?
`);
const deleteByToken = db.prepare('DELETE FROM sessions WHERE token_hash = ?');
const deleteExpired = db.prepare('DELETE FROM sessions WHERE expires_at <= ?');

export function saveSession(tokenHash, userId, expiresAt) {
  insertSession.run(tokenHash, userId, expiresAt);
}

export function findUserBySession(tokenHash) {
  return selectUserByToken.get(tokenHash, Date.now());
}

export function removeSession(tokenHash) {
  deleteByToken.run(tokenHash);
}

export function purgeExpiredSessions() {
  deleteExpired.run(Date.now());
}
