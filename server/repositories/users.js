import { db } from '../db.js';

const insertUser = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
const selectByEmail = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?');

export function findUserByEmail(email) {
  return selectByEmail.get(email);
}

export function createUser(email, passwordHash) {
  const { lastInsertRowid } = insertUser.run(email, passwordHash);
  return { id: Number(lastInsertRowid), email };
}
