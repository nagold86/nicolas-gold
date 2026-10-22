#!/usr/bin/env node
/**
 * La lupa de Pippin.
 *
 * Abre la página en un Edge headless, emula movimiento normal o reducido,
 * recorre cada sección y guarda una captura. También mide desbordes y junta
 * los errores de consola. No se publica: es una herramienta de taller.
 *
 * Uso: node tools/audit.mjs [--url=http://127.0.0.1:4173/] [--out=.qa]
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = (process.argv.find((arg) => arg.startsWith('--url=')) || '--url=http://127.0.0.1:4173/').slice(6).replace(/\/+$/, '');
const SALIDA = resolve((process.argv.find((arg) => arg.startsWith('--out=')) || '--out=.qa').slice(6));
const PUERTO = 9300 + Math.floor(Math.random() * 200);
const PERFIL = join(process.env.TEMP || '.', `edge-lupa-${process.pid}`);

const ESCENARIOS = [
  { nombre: 'portada-1440', ancho: 1440, alto: 900, hash: '', espera: 950 },
  { nombre: 'prefacio-1440', ancho: 1440, alto: 900, hash: '#prefacio' },
  { nombre: 'sendero-1440', ancho: 1440, alto: 900, hash: '#sendero' },
  { nombre: 'equipaje-1440', ancho: 1440, alto: 900, hash: '#equipaje' },
  { nombre: 'pergaminos-1440', ancho: 1440, alto: 900, hash: '#pergaminos' },
  { nombre: 'senal-1440', ancho: 1440, alto: 900, hash: '#senal' },
  { nombre: 'portada-390', ancho: 390, alto: 844, hash: '', movil: true, espera: 950 },
  { nombre: 'prefacio-390', ancho: 390, alto: 844, hash: '#prefacio', movil: true },
  { nombre: 'pergaminos-390', ancho: 390, alto: 844, hash: '#pergaminos', movil: true },
  { nombre: 'senal-390', ancho: 390, alto: 844, hash: '#senal', movil: true },
  { nombre: 'portada-1280', ancho: 1280, alto: 800, hash: '', espera: 950 },
  { nombre: 'portada-768', ancho: 768, alto: 1024, hash: '', espera: 950 },
  { nombre: 'portada-320', ancho: 320, alto: 640, hash: '', movil: true, espera: 950 },
  { nombre: 'portada-reduce', ancho: 1440, alto: 900, hash: '', movimiento: 'reduce' },
  { nombre: 'pergaminos-sin-js', ancho: 1440, alto: 900, hash: '#pergaminos', scripts: false }
];

const errores = [];
const filas = [];

function anotar(texto) {
  if (String(texto).includes('chrome-extension://')) return;
  errores.push(texto);
}

function fallar(mensaje) {
  console.error(`\n  ✗ La lupa se detuvo: ${mensaje}\n`);
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
    '--hide-scrollbars',
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

    if (mensaje.method === 'Runtime.exceptionThrown') {
      const detalle = mensaje.params.exceptionDetails;
      anotar(`excepción: ${detalle.exception?.description || detalle.text}`);
    }

    if (mensaje.method === 'Log.entryAdded' && mensaje.params.entry.level === 'error') {
      anotar(`log: ${mensaje.params.entry.text}`);
    }

    if (mensaje.method === 'Runtime.consoleAPICalled' && mensaje.params.type === 'error') {
      anotar(`consola: ${mensaje.params.args.map((arg) => arg.value || arg.description).join(' ')}`);
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

async function evaluar(enviar, expression) {
  const resultado = await enviar('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (resultado.exceptionDetails) {
    throw new Error(resultado.exceptionDetails.exception?.description || resultado.exceptionDetails.text);
  }
  return resultado.result.value;
}

async function principal() {
  await mkdir(SALIDA, { recursive: true });
  const { proceso, pagina } = await abrirNavegador();
  const { ws, enviar, esperarEvento } = await conectar(pagina.webSocketDebuggerUrl);

  try {
    await enviar('Page.enable');
    await enviar('Runtime.enable');
    await enviar('Log.enable');

    for (const [indice, escenario] of ESCENARIOS.entries()) {
      const {
        nombre, ancho, alto, hash = '', movil = false,
        movimiento = 'no-preference', scripts = true, espera = 780
      } = escenario;

      await enviar('Emulation.setDeviceMetricsOverride', {
        width: ancho,
        height: alto,
        deviceScaleFactor: 1,
        mobile: movil
      });
      await enviar('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: movimiento }]
      });
      if (movil) {
        await enviar('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      }
      await enviar('Emulation.setScriptExecutionDisabled', { value: !scripts });

      const carga = esperarEvento('Page.loadEventFired');
      const url = `${BASE}/?lupa=${indice}${hash}`;
      await enviar('Page.navigate', { url });
      await Promise.race([carga, esperar(9000)]);
      await esperar(280);

      if (scripts) {
        await evaluar(enviar, 'document.fonts.ready.then(() => true)').catch(() => {});
      } else {
        await esperar(500);
      }

      await esperar(espera);

      const metrica = await evaluar(enviar, `(() => {
        const caja = (selector) => {
          const elemento = document.querySelector(selector);
          if (!elemento) return null;
          const r = elemento.getBoundingClientRect();
          return { arriba: Math.round(r.top), abajo: Math.round(r.bottom), alto: Math.round(r.height) };
        };
        const chispa = document.querySelector('[data-chispa]');
        return {
          ancho: window.innerWidth,
          alto: window.innerHeight,
          desborde: document.documentElement.scrollWidth - window.innerWidth,
          portada: caja('#portada'),
          pie: caja('.portada__pie'),
          bajar: caja('.portada__bajar'),
          chispa: chispa ? { oculta: chispa.hidden, display: getComputedStyle(chispa).display } : null,
          pergaminos: document.querySelectorAll('.pergamino').length,
          fuentes: document.fonts.status,
          reducido: matchMedia('(prefers-reduced-motion: reduce)').matches,
          revelar: document.querySelectorAll('.revelar').length,
          senal: (() => {
            const elemento = document.querySelector('.senal__texto');
            if (!elemento) return null;
            const r = elemento.getBoundingClientRect();
            return {
              arriba: Math.round(r.top),
              abajo: Math.round(r.bottom),
              opacidad: getComputedStyle(elemento).opacity,
              clases: elemento.className
            };
          })()
        };
      })()`);

      const captura = await enviar('Page.captureScreenshot', { format: 'png', fromSurface: true });
      const archivo = join(SALIDA, `${nombre}.png`);
      await writeFile(archivo, Buffer.from(captura.data, 'base64'));

      filas.push({ nombre, metrica });
      const aviso = metrica.desborde > 0 ? `  ⚠ desborde ${metrica.desborde}px` : '';
      const senal = metrica.senal ? `  señal ${metrica.senal.opacidad}/${metrica.senal.arriba}` : '';
      console.log(`  · ${nombre.padEnd(20)} ${metrica.ancho}×${metrica.alto}  pergaminos ${metrica.pergaminos}  revelar ${metrica.revelar}${senal}${aviso}`);
    }
  } finally {
    try {
      await enviar('Browser.close');
    } catch {
      // Si la conexión ya se cerró, no hay nada que cerrar.
    }
    ws.close();
    proceso.kill();
    await esperar(400);
  }

  const desbordes = filas.filter((fila) => fila.metrica.desborde > 0);
  const sinJs = filas.find((fila) => fila.nombre === 'pergaminos-sin-js');

  console.log('');
  if (sinJs && sinJs.metrica.pergaminos < 2) {
    errores.push(`sin JS se esperaban al menos 2 tarjetas y hay ${sinJs.metrica.pergaminos}`);
  }
  if (desbordes.length > 0) {
    errores.push(`desborde horizontal en ${desbordes.map((fila) => fila.nombre).join(', ')}`);
  }
  if (errores.length > 0) {
    console.error(`  ✗ ${errores.length} hallazgo(s):`);
    for (const error of errores) console.error(`    · ${error}`);
    process.exit(1);
  }

  console.log(`  ✓ ${filas.length} capturas en ${SALIDA}`);
  console.log('  ✓ sin errores de consola, sin desborde horizontal, tarjetas sin JS');
}

principal().catch((error) => fallar(error.message));
