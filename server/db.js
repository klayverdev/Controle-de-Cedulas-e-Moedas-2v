import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config.js';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS operations (
    id         INTEGER PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction  INTEGER NOT NULL CHECK (direction IN (1, -1)),
    source     TEXT    NOT NULL CHECK (source IN ('manual', 'import')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_operations_user ON operations (user_id);

  CREATE TABLE IF NOT EXISTS operation_items (
    operation_id       INTEGER NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
    denomination_cents INTEGER NOT NULL,
    quantity           INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (operation_id, denomination_cents)
  );
`;

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(SCHEMA);
