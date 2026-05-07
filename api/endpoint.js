const os = require('os');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const data = {
    platform: os.platform(),
    release: os.release(),
    hostname: os.hostname(),
    totalMem: (os.totalmem() / 1e9).toFixed(2),
    freeMem: (os.freemem() / 1e9).toFixed(2),
    uptime: (os.uptime() / 3600).toFixed(2),
    cpus: os.cpus().length,
    userInfo: 'agent'   // hide real username on public deployment
  };

  res.status(200).json(data);
};
