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

  // Your Google Apps Script Web App endpoint
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzKg6fQI_IWAJwOP_JhDjFXPWoDxv_iukIis_qPqS_DsoIWwvXfPQBNFSP5N-c3vxSm/exec';

  // Function to get real client IP
  function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  }

  try {
    let body = req.body;
    // If body is a string, parse it
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    // Add IP address and default event if not present
    const dataWithIp = {
      ...body,
      ip: getClientIp(req),
      event: body?.event || 'message'
    };

    const forwardRes = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataWithIp)
    });

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
