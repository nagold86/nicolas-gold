#!/usr/bin/env node
/**
 * El retrato de la comarca.
 *
 * Renderiza tools/og.html a 1200×630 y guarda assets/og.png. La tarjeta se
 * escribe una sola vez; este taller la vuelve a fotografiar cuando cambia.
 *
 * Uso: node tools/og.mjs
 */

import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as esperar } from 'node:timers/promises';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PUERTO = 9500 + Math.floor(Math.random() * 200);
const PERFIL = join(process.env.TEMP || '.', `edge-og-${process.pid}`);
const ORIGEN = pathToFileURL(resolve('tools/og.html')).href;
const DESTINO = resolve('assets/og.png');
const ANCHO = 1200;
const ALTO = 630;

function fallar(mensaje) {
  console.error(`\n  ✗ La tarjeta no se pudo retratar: ${mensaje}\n`);
  process.exit(1);
}

async function abrirNavegador() {
  const proceso = spawn(EDGE, [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${PERFIL}`,
    `--remote-debugging-port=${PUERTO}`,
    `--hide-scrollbars`,
    `--window-size=${ANCHO},${ALTO}`,
    'about:blank'
  ], { stdio: 'ignore' });

  for (let intento = 0; intento < 80; intento += 1) {
    try {
      const respuesta = await fetch(`http://127.0.0.1:${PUERTO}/json/list`);
      const lista = await respuesta.json();
      const pagina = lista.find((objetivo) => objetivo.type === 'page');
      if (pagina) return { proceso, pagina };
    } catch {
      // Edge todavía está despertando.
    }
    await esperar(150);
  }

  proceso.kill();
  fallar('Edge no abrió el puerto de depuración.');
}

async function conectar(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pendientes = new Map();
  const eventos = new Map();
  let contador = 0;

  ws.addEventListener('message', (evento) => {
    const mensaje = JSON.parse(evento.data);
    if (mensaje.id && pendientes.has(mensaje.id)) {
      const { resolver, rechazar } = pendientes.get(mensaje.id);
      pendientes.delete(mensaje.id);
      if (mensaje.error) rechazar(new Error(mensaje.error.message));
      else resolver(mensaje.result);
      return;
    }
    const esperas = eventos.get(mensaje.method);
    if (esperas) {
      eventos.delete(mensaje.method);
      for (const resolver of esperas) resolver(mensaje.params);
    }
  });

  await new Promise((resolver, rechazar) => {
    ws.addEventListener('open', resolver, { once: true });
    ws.addEventListener('error', rechazar, { once: true });
  });

  const enviar = (method, params = {}) => new Promise((resolver, rechazar) => {
    const id = (contador += 1);
    pendientes.set(id, { resolver, rechazar });
    ws.send(JSON.stringify({ id, method, params }));
  });

  const esperarEvento = (method) => new Promise((resolver) => {
    const esperas = eventos.get(method) || [];
    esperas.push(resolver);
    eventos.set(method, esperas);
  });

  return { ws, enviar, esperarEvento };
}

async function principal() {
  const { proceso, pagina } = await abrirNavegador();
  const { ws, enviar, esperarEvento } = await conectar(pagina.webSocketDebuggerUrl);

  try {
    await enviar('Page.enable');
    await enviar('Runtime.enable');
    await enviar('Emulation.setDeviceMetricsOverride', {
      width: ANCHO,
      height: ALTO,
      deviceScaleFactor: 1,
      mobile: false
    });

    const carga = esperarEvento('Page.loadEventFired');
    await enviar('Page.navigate', { url: ORIGEN });
    await Promise.race([carga, esperar(12000)]);
    await enviar('Runtime.evaluate', {
      expression: 'document.fonts.ready.then(() => true)',
      awaitPromise: true,
      returnByValue: true
    }).catch(() => {});
    await esperar(600);

    const captura = await enviar('Page.captureScreenshot', { format: 'png', fromSurface: true });
    await writeFile(DESTINO, Buffer.from(captura.data, 'base64'));
    console.log(`  ✓ ${DESTINO} · ${ANCHO}×${ALTO}`);
  } finally {
    ws.close();
    proceso.kill();
  }
}

principal().catch((error) => fallar(error.message));
