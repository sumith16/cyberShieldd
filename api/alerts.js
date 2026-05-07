const https = require('https');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const CISA_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

  https.get(CISA_URL, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const recent = parsed.vulnerabilities
          .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
          .slice(0, 5);
        res.status(200).json(recent);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse CISA feed' });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: e.message });
  });
};
