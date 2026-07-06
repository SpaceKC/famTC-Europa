// netlify/functions/files.js
// Incarca, serveste si sterge fisiere (poze, PDF-uri) folosind Netlify Blobs.
//
// POST   /api/files { name, dataBase64, contentType } -> { id }   (protejat prin PIN)
// GET    /api/files?id=X                               -> fisierul binar (fara PIN, ca o poza sa se poata afisa direct in <img>)
// DELETE /api/files { id }                              -> { ok }   (protejat prin PIN)
//
// Limita: request-urile catre functii Netlify sunt limitate la ~6MB per request (plan gratuit).

const { getStore } = require('@netlify/blobs');

function fileStore() {
  return getStore({
    name: 'trip-files',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}
function dataStore() {
  return getStore({
    name: 'trip-data',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

async function checkPin(event) {
  const pin = event.headers['x-trip-pin'] || event.headers['X-Trip-Pin'];
  if (!pin) return false;
  const real = await dataStore().get('trip_pin', { type: 'text' });
  return pin === real;
}

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'GET') {
      // Servire fisier - fara PIN, ca sursa de imagine/link sa functioneze direct in HTML.
      // ID-urile sunt aleatorii si necunoscute fara acces la jurnal, deci e un compromis acceptabil.
      const id = (event.queryStringParameters || {}).id;
      if (!id) return { statusCode: 400, body: 'id lipsă' };
      const result = await fileStore().getWithMetadata(id, { type: 'arrayBuffer' });
      if (!result) return { statusCode: 404, body: 'Fișier negăsit' };
      const { data, metadata } = result;
      return {
        statusCode: 200,
        headers: {
          'Content-Type': (metadata && metadata.contentType) || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
        body: Buffer.from(data).toString('base64'),
        isBase64Encoded: true,
      };
    }

    const headersJson = { 'Content-Type': 'application/json' };
    if (!(await checkPin(event))) {
      return { statusCode: 401, headers: headersJson, body: JSON.stringify({ error: 'PIN lipsă sau incorect.' }) };
    }

    if (event.httpMethod === 'POST') {
      const { name, dataBase64, contentType } = JSON.parse(event.body || '{}');
      if (!dataBase64) return { statusCode: 400, headers: headersJson, body: JSON.stringify({ error: 'Fișier lipsă.' }) };
      const buffer = Buffer.from(dataBase64, 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        return { statusCode: 413, headers: headersJson, body: JSON.stringify({ error: 'Fișier prea mare (limită ~5MB).' }) };
      }
      const id = 'f' + Date.now() + Math.random().toString(36).slice(2, 9);
      await fileStore().set(id, buffer, {
        metadata: { contentType: contentType || 'application/octet-stream', name: name || id },
      });
      return { statusCode: 200, headers: headersJson, body: JSON.stringify({ id }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body || '{}');
      if (!id) return { statusCode: 400, headers: headersJson, body: JSON.stringify({ error: 'id lipsă.' }) };
      await fileStore().delete(id);
      return { statusCode: 200, headers: headersJson, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: headersJson, body: JSON.stringify({ error: 'Metodă neacceptată.' }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Eroare server: ' + e.message }) };
  }
};
