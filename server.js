const http = require('http');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // CORS Headers for frontend connection
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Serve Frontend HTML Files
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname.endsWith('.html'))) {
    try {
        const filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
        const html = fs.readFileSync(require('path').join(__dirname, filePath), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    } catch(e) {
        res.writeHead(404);
        res.end('HTML file not found: ' + url.pathname);
        return;
    }
  }

  // 1. Endpoint: Real OS Metrics
  if (req.method === 'GET' && url.pathname === '/api/endpoint') {
    const data = {
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname(),
      totalMem: (os.totalmem() / 1e9).toFixed(2),
      freeMem: (os.freemem() / 1e9).toFixed(2),
      uptime: (os.uptime() / 3600).toFixed(2),
      cpus: os.cpus().length,
      userInfo: os.userInfo().username
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
  
  // 2. Firewall/IDS: Real Network Connections (netstat)
  else if (req.method === 'GET' && url.pathname === '/api/netstat') {
    exec('netstat -an | findstr "ESTABLISHED LISTENING"', (error, stdout, stderr) => {
      if (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to run netstat' }));
        return;
      }
      
      const lines = stdout.split('\n').filter(l => l.trim().length > 0).slice(0, 100);
      const connections = [];
      let established = 0;
      let listening = 0;

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const state = parts.length > 4 ? parts[4] : parts[3];
          if (state === 'ESTABLISHED') established++;
          if (state === 'LISTENING') listening++;
          
          connections.push({
            proto: parts[0],
            local: parts[1],
            foreign: parts[2],
            state: state
          });
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: connections.length,
        established,
        listening,
        connections
      }));
    });
  }

  // 3. Antivirus: Real Local File Hashing & Stat Checking
  else if (req.method === 'POST' && url.pathname === '/api/scan-file') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { filePath } = JSON.parse(body);
        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'File not found on local disk' }));
          return;
        }

        const stats = fs.statSync(filePath);
        if (stats.size > 100 * 1024 * 1024) { // 100MB limit
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'File too large for real-time hash (>100MB)' }));
          return;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const hex = hashSum.digest('hex');

        // --- ORIGINAL THREAT DETECTION ENGINE ---
        const isExe = fileBuffer.length > 2 && fileBuffer[0] === 0x4D && fileBuffer[1] === 0x5A; // MZ header
        
        // 1. Shannon Entropy (Detects packing/encryption)
        let entropy = 0;
        const frequencies = new Array(256).fill(0);
        for (let i = 0; i < fileBuffer.length; i++) frequencies[fileBuffer[i]]++;
        for (let i = 0; i < 256; i++) {
            const p = frequencies[i] / fileBuffer.length;
            if (p > 0) entropy -= p * Math.log2(p);
        }
        
        // 2. Heuristic Signature Scanning (IoCs)
        const sampleText = fileBuffer.slice(0, Math.min(fileBuffer.length, 500000)).toString('ascii'); // Scan first 500KB
        const iocs = [];
        if (sampleText.includes('powershell') && (sampleText.includes('-enc') || sampleText.includes('-ExecutionPolicy'))) iocs.push('Suspicious PowerShell Execution');
        if (sampleText.includes('WScript.Shell')) iocs.push('Windows Script Host Execution');
        if (sampleText.includes('CreateRemoteThread') || sampleText.includes('VirtualAllocEx')) iocs.push('Process Injection APIs (Malware capability)');
        if (sampleText.match(/http:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/)) iocs.push('Hardcoded IP Address Communication');
        if (sampleText.includes('stratum+tcp://')) iocs.push('Cryptomining Pool Connection');
        if (sampleText.includes('vssadmin.exe Delete Shadows')) iocs.push('Ransomware Behavior (Deleting Shadow Copies)');

        let riskLevel = 'LOW';
        let isMalware = false;
        
        if (isExe && entropy > 7.2) {
            iocs.push(`High Entropy (${entropy.toFixed(2)}): File is likely packed or encrypted (Common in Malware/Ransomware)`);
            riskLevel = 'MEDIUM';
        }
        if (iocs.length > 0) {
            isMalware = true;
            riskLevel = iocs.length > 2 || entropy > 7.4 ? 'CRITICAL' : 'HIGH';
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          hash: hex,
          size: stats.size,
          created: stats.birthtime,
          ext: filePath.split('.').pop(),
          entropy: entropy.toFixed(2),
          isExe: isExe,
          riskLevel: riskLevel,
          iocs: iocs,
          isMalware: isMalware
        }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }

  // 4. Web Security: Real URL/Header checking
  else if (req.method === 'POST' && url.pathname === '/api/scan-url') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { url: targetUrl } = JSON.parse(body);
        let target;
        try {
          target = new URL(targetUrl.startsWith('http') ? targetUrl : 'http://' + targetUrl);
        } catch(e) {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'Invalid URL format' }));
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
                const cert = response.socket.getPeerCertificate();
                if (cert && Object.keys(cert).length > 0) {
                  certInfo = {
                      valid_to: cert.valid_to,
                      issuer: cert.issuer?.O || 'Unknown'
                  };
                }
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: response.statusCode,
                server: response.headers['server'] || 'Hidden',
                xframe: response.headers['x-frame-options'] || 'Missing',
                cert: certInfo,
                isSafe: response.statusCode >= 200 && response.statusCode < 400
            }));
        });

        request.on('error', (e) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message, isSafe: false }));
        });
        
        request.on('timeout', () => {
            request.destroy();
        });

        request.end();
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Server error analyzing URL' }));
      }
    });
  }

  // 5. Threat Intelligence: Real-time CISA KEV Alerts
  else if (req.method === 'GET' && url.pathname === '/api/alerts') {
    https.get('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const recent = parsed.vulnerabilities.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(recent));
            } catch(e) {
                res.writeHead(500); res.end(JSON.stringify({error: 'Failed to parse CISA feed'}));
            }
        });
    }).on('error', (e) => {
        res.writeHead(500); res.end(JSON.stringify({error: e.message}));
    });
  }
  else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`[CyberShield Backend] Real-time engine running on http://localhost:${PORT}`);
  console.log(`Ready to provide genuine OS metrics, live network data, and real file hashes.`);
});
