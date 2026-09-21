const JSON_HEADERS = { 'Content-Type': 'application/json' };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? JSON_HEADERS : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Sem conexão com o servidor.', 0);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error ?? 'Erro inesperado.', response.status);

  return data;
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (credentials) => request('/auth/register', { method: 'POST', body: credentials }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  listOperations: () => request('/operations'),
  createOperation: (operation) => request('/operations', { method: 'POST', body: operation }),
  deleteOperation: (id) => request(`/operations/${id}`, { method: 'DELETE' }),
  restoreOperation: (id) => request(`/operations/${id}/restore`, { method: 'POST' }),
};
