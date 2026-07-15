import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 3000);
const root = process.cwd();
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png', '.pdf':'application/pdf', '.svg':'image/svg+xml', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml; charset=utf-8' };

createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    if (pathname.startsWith('/api/')) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Use `vercel dev` to test serverless functions.' }));
    }
    let file = normalize(join(root, pathname));
    if (!file.startsWith(root)) throw new Error('Invalid path');
    try {
      const info = await stat(file);
      if (info.isDirectory()) file = join(file, 'index.html');
    } catch {
      if (!extname(file)) file = join(file, 'index.html');
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, () => console.log(`WAO website: http://localhost:${port}`));
