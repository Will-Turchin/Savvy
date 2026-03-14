const API_URL = 'http://localhost:4000/api';

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

export async function apiPost(path, payload) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} failed`);
}

export function streamApi(path, { onMessage, onError, onOpen, onDone } = {}) {
  const stream = new EventSource(`${API_URL}${path}`);

  stream.addEventListener('open', () => {
    onOpen?.();
  });

  stream.addEventListener('items', (event) => {
    onMessage?.(JSON.parse(event.data));
  });

  stream.addEventListener('done', (event) => {
    onDone?.(event.data ? JSON.parse(event.data) : undefined);
    stream.close();
  });

  stream.addEventListener('error-message', (event) => {
    onError?.(event.data ? JSON.parse(event.data) : { message: 'Streaming recommendations failed.' });
  });

  stream.addEventListener('error', (event) => {
    onError?.({ message: 'Recommendation stream disconnected unexpectedly.', event });
  });

  return () => stream.close();
}
