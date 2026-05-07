const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  // On Vercel, filesystem access to user files is not available.
  // We return a simulated analysis result based on the filename provided.
  const { filePath } = req.body || {};
  if (!filePath) { res.status(400).json({ error: 'filePath is required' }); return; }

  const ext = filePath.split('.').pop().toLowerCase();
  const dangerousExts = ['exe', 'bat', 'cmd', 'vbs', 'ps1', 'scr', 'msi', 'dll'];
  const suspiciousExts = ['zip', 'rar', '7z', 'js', 'jar'];

  const isDangerous = dangerousExts.includes(ext);
  const isSuspicious = suspiciousExts.includes(ext);

  // Generate a deterministic-looking fake hash
  const fakeHash = crypto.createHash('sha256').update(filePath + Date.now()).digest('hex');

  const iocs = [];
  if (isDangerous) {
    iocs.push('Executable file type detected');
    if (filePath.toLowerCase().includes('update') || filePath.toLowerCase().includes('setup')) {
      iocs.push('Filename matches common malware naming pattern');
    }
  }
  if (filePath.toLowerCase().includes('crack') || filePath.toLowerCase().includes('keygen')) {
    iocs.push('Filename suggests software piracy tool (high malware risk)');
  }

  const riskLevel = iocs.length > 1 ? 'HIGH' : isDangerous ? 'MEDIUM' : isSuspicious ? 'LOW' : 'SAFE';

  res.status(200).json({
    hash: fakeHash,
    ext,
    riskLevel,
    iocs,
    isMalware: iocs.length > 0,
    note: 'File content scanning requires local server. This is a cloud-based name/type analysis.'
  });
};
