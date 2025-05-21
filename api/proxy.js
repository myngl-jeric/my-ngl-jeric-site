export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Your new Google Apps Script Web App endpoint
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzKg6fQI_IWAJwOP_JhDjFXPWoDxv_iukIis_qPqS_DsoIWwvXfPQBNFSP5N-c3vxSm/exec';

  try {
    // Forward the POST body to GAS
    const forwardRes = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    // GAS may return text or JSON; handle both
    const contentType = forwardRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await forwardRes.json();
      res.status(200).json(data);
    } else {
      const text = await forwardRes.text();
      res.status(200).send(text);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
