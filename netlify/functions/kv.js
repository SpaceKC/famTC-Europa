// netlify/functions/kv.js
// Citire / scriere / stergere de chei text-JSON, folosind Netlify Blobs.
// Toate cererile trebuie sa aiba header-ul x-trip-pin cu PIN-ul corect.
//
// GET    /api/kv?key=X          -> { value }
// POST   /api/kv  { key, value } -> { ok }
// DELETE /api/kv?key=X          -> { ok }

const { getStore } = require('@netlify/blobs');

function store() {
  return getStore({
    name: 'trip-data',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

async function checkPin(event) {
  const pin = event.headers['x-trip-pin'] || event.headers['X-Trip-Pin'];
  if (!pin) return false;
  const real = await store().get('trip_pin', { type: 'text' });
  return pin === real;
}

exports.handler = async function (event) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    if (!(await checkPin(event))) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'PIN lipsă sau incorect.' }) };
    }
    const s = store();

    if (event.httpMethod === 'GET') {
      const key = (event.queryStringParameters || {}).key;
      if (!key) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Parametrul key lipsește.' }) };
      const value = await s.get(key, { type: 'text' });
      return { statusCode: 200, headers, body: JSON.stringify({ value }) };
    }

    if (event.httpMethod === 'POST') {
      const { key, value } = JSON.parse(event.body || '{}');
      if (!key) return { statusCode: 400, headers, body: JSON.stringify({ error: 'key lipsește din body.' }) };
      await s.set(key, value == null ? '' : String(value));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const key = (event.queryStringParameters || {}).key;
      if (!key) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Parametrul key lipsește.' }) };
      await s.delete(key);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Metodă neacceptată.' }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Eroare server: ' + e.message }) };
  }
};
