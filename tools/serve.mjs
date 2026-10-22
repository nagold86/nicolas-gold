#!/usr/bin/env node
/**
 * Servidor mínimo de preview. Sirve la carpeta dist/ en 127.0.0.1.
 * Sin dependencias, sin recarga automática: se vuelve a forjar con npm run build.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PUERTO = Number(process.env.PORT || 4173);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function dentroDeRaiz(ruta) {
  return ruta === RAIZ || ruta.startsWith(RAIZ + sep);
}

async function buscarArchivo(pathname) {
  let limpio;
  try {
    limpio = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (limpio.includes('\0')) return null;

  const relativo = limpio === '/' ? '/index.html' : limpio;
  const candidatos = [relativo, `${relativo}.html`, `${relativo}/index.html`];

  for (const candidato of candidatos) {
    const ruta = resolve(RAIZ, '.' + candidato);
    if (!dentroDeRaiz(ruta)) continue;
    try {
      const info = await stat(ruta);
      if (info.isFile()) return ruta;
    } catch {
      // sigue con el próximo candidato
    }
  }

  return null;
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);
  const ruta = await buscarArchivo(url.pathname);

  if (!ruta) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><meta charset="utf-8"><title>404</title><p>Esa página no está en el libro.</p>');
    return;
  }

  try {
    const cuerpo = await readFile(ruta);
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(ruta).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : cuerpo);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No se pudo leer el archivo.');
  }
});

servidor.listen(PUERTO, '127.0.0.1', () => {
  console.log(`\n  ✦ Comarca de Luz en http://127.0.0.1:${PUERTO}\n`);
});
