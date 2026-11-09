const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));

// Body parsing with sane payload limits (Acceptance A22)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Plaionn Hockey Directory API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/events', require('./routes/events'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/interests', require('./routes/interests'));
app.use('/api/email-verifications', require('./routes/verifications'));
app.use('/api/listing-requests', require('./routes/listingRequests'));
app.use('/api/admin', require('./routes/admin'));

// Acceptance Test Runner Endpoint
app.get('/api/admin-tests/run', async (req, res) => {
  const token = req.headers['x-admin-token'] || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);
  if (token !== 'plaionn-admin-key') {
    return res.status(401).json({ error: 'Admin authorization required' });
  }

  try {
    const { runAllAcceptanceTests } = require('../tests/acceptance.test');
    const results = await runAllAcceptanceTests();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Serve frontend build in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global safe error handler (Acceptance A04, A22)
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
    code: err.code || 'INTERNAL_ERROR'
  });
});

if (require.main === module) {
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    const ips = getLocalIpAddresses();
    console.log(`\n🏒 Plaionn Hockey Directory Server is LIVE!`);
    console.log(`   ➜  Local:   http://localhost:${PORT}`);
    if (ips.length > 0) {
      ips.forEach(ip => {
        console.log(`   ➜  Network: http://${ip}:${PORT}`);
      });
      console.log(`   💡 Share the Network link with any phone/PC on your Wi-Fi!`);
    }
    console.log('');
  });
}

module.exports = app;
