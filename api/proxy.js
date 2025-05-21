export default async function handler(req, res) {
  // --- CORS Headers ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // --- Handle preflight (OPTIONS) ---
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Your Google Apps Script Web App endpoint
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwfN6lEfQ3I2nKwfr1ikx7q0FV9vgfXwI2NlVETlX1wX9fcjyOn2iyAVYkg9EV-ltq3/exec';

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
