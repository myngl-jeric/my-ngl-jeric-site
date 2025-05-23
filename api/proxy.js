export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Your updated Google Apps Script Web App endpoint:
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbzRjK694JMtp50tPnAczR4yb8CYG3Mp237r8HuuZJATqw6K5VkV6OHxIUdZoOSUmnIj/exec';

  function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const ip = getClientIp(req);
    console.log('Extracted IP:', ip); // Debug log

    // Add the IP and default event if not already set
    const dataWithIp = {
      ...body,
      ip: ip || 'unknown',
      event: body?.event || 'message'
    };

    // Log exactly what is being sent for debugging
    console.log("Proxy is sending to Apps Script:", JSON.stringify(dataWithIp));

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
    console.error('Vercel Proxy Error:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
}
