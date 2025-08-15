// Flux Web minimal API + static server
// Reads /etc/flux-web/config.json and /etc/flux-web/catalog.json
// Serves static UI from /opt/flux-web/web (by default) and exposes:
//   GET  /api/ping
//   GET  /api/catalog
//   POST /api/run  { id, args:[], flags:{k:v}, rawArgs:[] }
//
// Auth: pass the token via either
//   - Authorization: Bearer <token>
//   - X-Flux-Token: <token>
//
const fs = require('fs');
const path = require('path');
const express = require('express');
const { spawn } = require('child_process');

const CONFIG_PATH = process.env.FLUX_WEB_CONFIG || '/etc/flux-web/config.json';
const CATALOG_PATH = process.env.FLUX_WEB_CATALOG || '/etc/flux-web/catalog.json';

function loadJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${file}:`, e.message);
    return null;
  }
}

let config = loadJson(CONFIG_PATH) || {
  token: 'REPLACE_WITH_A_LONG_RANDOM_TOKEN',
  fluxPath: '/usr/local/bin/flux',
  baseDir: '/Server/Applications',
  staticDir: '/opt/flux-web/web',
  bind: '127.0.0.1',
  port: 3088
};
let catalog = loadJson(CATALOG_PATH) || { title: 'Flux Command Catalog', version: 'unknown', commands: [] };

const app = express();
app.use(express.json({ limit: '1mb' }));

// --- simple auth middleware ---
function auth(req, res, next) {
  const h = req.headers['authorization'] || '';
  const viaAuth = h.startsWith('Bearer ') ? h.slice(7) : '';
  const viaHeader = req.headers['x-flux-token'] || '';
  const token = viaAuth || viaHeader || '';
  if (!config.token || config.token === 'REPLACE_WITH_A_LONG_RANDOM_TOKEN') {
    // Unsafe but helpful default for first run: if token is unset/placeholder, allow local only.
    if (req.ip === '127.0.0.1' || req.ip === '::1') return next();
    return res.status(403).json({ error: 'Token not set. Edit ' + CONFIG_PATH });
  }
  if (token !== config.token) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// --- API routes ---
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, version: catalog.version || 'n/a' });
});

app.get('/api/catalog', auth, (req, res) => {
  res.json({ title: catalog.title, version: catalog.version, commands: catalog.commands || [] });
});

// Build argv based on catalog entry and payload
function buildArgv(entry, body) {
  const argv = [];
  // Optional exec chain (e.g., ["db"]) before the main command name
  if (Array.isArray(entry.exec)) argv.push(...entry.exec);
  // Main command name
  argv.push(entry.name);
  // Positional args, in order
  const argDefs = entry.args || [];
  for (const a of argDefs) {
    if (a.type === 'const') {
      argv.push(String(a.value));
      continue;
    }
    const val = body.args?.[a.name];
    if (a.required && (val === undefined || val === null || val === '')) {
      throw new Error(`Missing required arg: ${a.name}`);
    }
    if (val !== undefined && val !== null && val !== '') {
      argv.push(String(val));
    }
  }
  // Flags
  const flagDefs = entry.flags || [];
  for (const f of flagDefs) {
    const v = body.flags?.[f.name];
    if (v !== undefined && v !== null && v !== '') {
      argv.push(String(f.switch || `--${f.name}`), String(v));
    }
  }
  // Raw args appended (escape responsibility is on the caller/UI)
  if (Array.isArray(body.rawArgs)) argv.push(...body.rawArgs.map(String));
  return argv;
}

app.post('/api/run', auth, (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const entry = (catalog.commands || []).find(c => c.id === id);
    if (!entry) return res.status(404).json({ error: 'Unknown command id' });

    const argv = buildArgv(entry, req.body || {});

    const fluxBin = config.fluxPath || '/usr/local/bin/flux';
    const child = spawn(fluxBin, argv, { env: process.env });

    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => { err += d.toString(); });

    child.on('close', (code) => {
      res.json({ code, stdout: out, stderr: err });
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Static UI dir
const staticDir = config.staticDir && config.staticDir.length ? config.staticDir : '/opt/flux-web/web';
app.use(express.static(staticDir, { extensions: ['html'] }));

const bind = config.bind || '127.0.0.1';
const port = Number(config.port) || 3088;
app.listen(port, bind, () => {
  console.log(`flux-web running on http://${bind}:${port} (staticDir=${staticDir})`);
});
