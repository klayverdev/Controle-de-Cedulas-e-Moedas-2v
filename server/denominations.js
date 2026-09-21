import { HttpError } from './errors.js';

const ALLOWED_CENTS = new Set([20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 25, 10, 5]);
const MAX_QUANTITY = 100_000;

/**
 * Converte `{ "50": 3, "0.25": 10 }` em `[{ cents: 5000, quantity: 3 }, ...]`,
 * rejeitando denominações desconhecidas e quantidades inválidas.
 */
export function parseValues(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new HttpError(400, 'Contagem inválida.');
  }

  const seen = new Set();
  const items = Object.entries(values).map(([rawValue, quantity]) => {
    const cents = Math.round(Number(rawValue) * 100);

    if (!ALLOWED_CENTS.has(cents) || seen.has(cents)) {
      throw new HttpError(400, `Denominação inválida: R$ ${rawValue}.`);
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new HttpError(400, `Quantidade inválida para R$ ${rawValue}.`);
    }

    seen.add(cents);
    return { cents, quantity };
  });

  if (items.length === 0) throw new HttpError(400, 'Informe ao menos uma cédula ou moeda.');
  return items;
}
