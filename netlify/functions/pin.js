// netlify/functions/pin.js
// Gestioneaza PIN-ul grupului, folosind Netlify Blobs - zero configurare, functioneaza automat.
//
// GET            -> { isSet: bool }
// GET ?verify=X  -> { valid: bool }
// POST { pin }   -> seteaza PIN-ul PRIMA data
// PUT { oldPin, newPin } -> schimba PIN-ul existent

const { getStore } = require('@netlify/blobs');

function store() {
  return getStore({
    name: 'trip-data',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

exports.handler = async function (event) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const s = store();

    if (event.httpMethod === 'GET') {
      const pin = await s.get('trip_pin', { type: 'text' });
      const qs = event.queryStringParameters || {};
      if (qs.verify !== undefined) {
        return { statusCode: 200, headers, body: JSON.stringify({ valid: qs.verify === pin }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ isSet: pin !== null && pin !== undefined }) };
    }

    if (event.httpMethod === 'POST') {
      const existing = await s.get('trip_pin', { type: 'text' });
      if (existing !== null && existing !== undefined) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'PIN deja setat pentru acest jurnal.' }) };
      }
      const { pin } = JSON.parse(event.body || '{}');
      if (!pin) return { statusCode: 400, headers, body: JSON.stringify({ error: 'PIN lipsă.' }) };
      await s.set('trip_pin', String(pin));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'PUT') {
      const { oldPin, newPin } = JSON.parse(event.body || '{}');
      const existing = await s.get('trip_pin', { type: 'text' });
      if (String(oldPin) !== existing) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'PIN actual incorect.' }) };
      }
      if (!newPin) return { statusCode: 400, headers, body: JSON.stringify({ error: 'PIN nou lipsă.' }) };
      await s.set('trip_pin', String(newPin));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Metodă neacceptată.' }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Eroare server: ' + e.message }) };
  }
};
