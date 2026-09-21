import { Router } from 'express';
import { parseValues } from '../denominations.js';
import { HttpError } from '../errors.js';
import {
  createOperation,
  deleteOperation,
  findOperation,
  listOperations,
  restoreOperation,
} from '../repositories/operations.js';

const VALID_DIRECTIONS = [1, -1];
const VALID_SOURCES = ['manual', 'import'];

function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Operação não encontrada.');
  return id;
}

function parseOperation(body) {
  const { direction, source, values } = body ?? {};

  if (!VALID_DIRECTIONS.includes(direction)) throw new HttpError(400, 'Tipo de operação inválido.');
  if (!VALID_SOURCES.includes(source)) throw new HttpError(400, 'Origem da operação inválida.');

  return { direction, source, items: parseValues(values) };
}

const router = Router();

router.get('/', (req, res) => {
  res.json(listOperations(req.user.id));
});

router.post('/', (req, res) => {
  const operation = createOperation(req.user.id, parseOperation(req.body));
  res.status(201).json(operation);
});

router.delete('/:id', (req, res) => {
  const wasDeleted = deleteOperation(req.user.id, parseId(req.params.id));
  if (!wasDeleted) throw new HttpError(404, 'Operação não encontrada.');
  res.status(204).end();
});

router.post('/:id/restore', (req, res) => {
  const id = parseId(req.params.id);
  if (!restoreOperation(req.user.id, id)) throw new HttpError(404, 'Operação não encontrada.');
  res.json(findOperation(req.user.id, id));
});

export default router;
