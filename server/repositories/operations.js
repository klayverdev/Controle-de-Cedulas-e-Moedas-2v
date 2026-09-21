import { db } from '../db.js';

const insertOperation = db.prepare(
  'INSERT INTO operations (user_id, direction, source) VALUES (?, ?, ?)',
);
const insertItem = db.prepare(
  'INSERT INTO operation_items (operation_id, denomination_cents, quantity) VALUES (?, ?, ?)',
);
const selectOperations = db.prepare(`
  SELECT id, direction, source, created_at, deleted_at
  FROM operations
  WHERE user_id = ?
  ORDER BY id
`);
const selectOperation = db.prepare(`
  SELECT id, direction, source, created_at, deleted_at
  FROM operations
  WHERE id = ? AND user_id = ?
`);
const selectItems = db.prepare(`
  SELECT operation_id, denomination_cents, quantity
  FROM operation_items
  WHERE operation_id IN (SELECT id FROM operations WHERE user_id = ?)
  ORDER BY denomination_cents DESC
`);
const selectItemsOf = db.prepare(`
  SELECT operation_id, denomination_cents, quantity
  FROM operation_items
  WHERE operation_id = ?
  ORDER BY denomination_cents DESC
`);
const markDeleted = db.prepare(`
  UPDATE operations SET deleted_at = unixepoch()
  WHERE id = ? AND user_id = ? AND deleted_at IS NULL
`);
const unmarkDeleted = db.prepare(`
  UPDATE operations SET deleted_at = NULL
  WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL
`);

function toOperation(row, items) {
  return {
    id: row.id,
    direction: row.direction,
    source: row.source,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    values: Object.fromEntries(
      items.map(({ denomination_cents, quantity }) => [denomination_cents / 100, quantity]),
    ),
  };
}

export function listOperations(userId) {
  const itemsByOperation = new Map();
  selectItems.all(userId).forEach((item) => {
    const items = itemsByOperation.get(item.operation_id) ?? [];
    items.push(item);
    itemsByOperation.set(item.operation_id, items);
  });

  return selectOperations
    .all(userId)
    .map((row) => toOperation(row, itemsByOperation.get(row.id) ?? []));
}

export function findOperation(userId, id) {
  const row = selectOperation.get(id, userId);
  return row ? toOperation(row, selectItemsOf.all(row.id)) : null;
}

export const createOperation = db.transaction((userId, { direction, source, items }) => {
  const { lastInsertRowid } = insertOperation.run(userId, direction, source);
  items.forEach(({ cents, quantity }) => insertItem.run(lastInsertRowid, cents, quantity));
  return findOperation(userId, Number(lastInsertRowid));
});

export function deleteOperation(userId, id) {
  return markDeleted.run(id, userId).changes > 0;
}

export function restoreOperation(userId, id) {
  return unmarkDeleted.run(id, userId).changes > 0;
}
