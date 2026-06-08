// Mock mínimo del endpoint REST de Supabase (PostgREST) para E2E.
// Responde a GET /rest/v1/<tabla> con el fixture correspondiente, ignorando
// los filtros del query string (el filtrado real del catálogo ocurre en el
// cliente). Suficiente para que supabase-js reciba `data` y la app renderice.
import { createServer } from 'node:http';
import { tables } from './fixtures/db.mjs';

const PORT = Number(process.env.MOCK_SUPABASE_PORT || 54321);

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  const match = url.pathname.match(/^\/rest\/v1\/([^/?]+)/);
  if (match) {
    const table = match[1];
    const data = tables[table] || [];
    // single() pide un objeto con este Accept; devolvemos la primera fila.
    const accept = req.headers['accept'] || '';
    const body = accept.includes('vnd.pgrst.object')
      ? JSON.stringify(data[0] ?? null)
      : JSON.stringify(data);
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    res.end(body);
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
  res.end('[]');
});

server.listen(PORT, () => {
  console.log(`[mock-supabase] escuchando en http://127.0.0.1:${PORT}`);
});
