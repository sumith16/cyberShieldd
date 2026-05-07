// Vercel doesn't allow netstat. Return mock network data.
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  // Simulated network connections for cloud deployment
  const connections = [
    { proto: 'TCP', local: '0.0.0.0:443',  foreign: '0.0.0.0:0',          state: 'LISTENING' },
    { proto: 'TCP', local: '0.0.0.0:80',   foreign: '0.0.0.0:0',          state: 'LISTENING' },
    { proto: 'TCP', local: '127.0.0.1:53', foreign: '0.0.0.0:0',          state: 'LISTENING' },
    { proto: 'TCP', local: '10.0.0.1:443', foreign: '172.217.14.78:55234', state: 'ESTABLISHED' },
    { proto: 'TCP', local: '10.0.0.1:443', foreign: '151.101.1.69:55310',  state: 'ESTABLISHED' },
  ];

  res.status(200).json({
    total: connections.length,
    established: connections.filter(c => c.state === 'ESTABLISHED').length,
    listening: connections.filter(c => c.state === 'LISTENING').length,
    connections,
    note: 'Simulated data — live netstat requires local server.'
  });
};
