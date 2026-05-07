const https = require('https');
const http = require('http');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { url: targetUrl } = req.body || {};
  if (!targetUrl) { res.status(400).json({ error: 'URL is required' }); return; }

  let target;
  try {
    target = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);
  } catch (e) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  const reqOpts = {
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    path: target.pathname + target.search,
    method: 'HEAD',
    timeout: 4000
  };

  const client = target.protocol === 'https:' ? https : http;

  const request = client.request(reqOpts, (response) => {
    let certInfo = null;
    if (target.protocol === 'https:') {
      const cert = response.socket.getPeerCertificate?.();
      if (cert && Object.keys(cert).length > 0) {
        certInfo = { valid_to: cert.valid_to, issuer: cert.issuer?.O || 'Unknown' };
      }
    }
    res.status(200).json({
      status: response.statusCode,
      server: response.headers['server'] || 'Hidden',
      xframe: response.headers['x-frame-options'] || 'Missing',
      cert: certInfo,
      isSafe: response.statusCode >= 200 && response.statusCode < 400
    });
  });

  request.on('error', (e) => res.status(200).json({ error: e.message, isSafe: false }));
  request.on('timeout', () => request.destroy());
  request.end();
};
