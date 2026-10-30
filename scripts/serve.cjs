'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../web');
const port = Number(process.env.PORT || 5197);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf'};
http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  let file;
  try {
    const url = new URL(req.url, 'http://localhost');
    const name = decodeURIComponent(url.pathname);
    file = path.resolve(root, '.' + (name.endsWith('/') ? name + 'index.html' : name));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  } catch { res.writeHead(400); return res.end(); }
  fs.readFile(file, (err, body) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer', 'Cache-Control':'no-cache', 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; connect-src 'self'"});
    res.end(req.method === 'HEAD' ? undefined : body);
  });
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
