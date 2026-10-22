#!/usr/bin/env node
/**
 * Verifica que los enlaces de los pergaminos respondan antes de publicar.
 * No corre durante el build: es una puerta manual, con red.
 */

import { readFile } from 'node:fs/promises';

const datos = JSON.parse(await readFile(new URL('../data/projects.json', import.meta.url), 'utf8'));
const enlaces = [...new Set(datos.pergaminos.filter((p) => p.href).map((p) => p.href))];

let fallos = 0;

for (const enlace of enlaces) {
  try {
    const opciones = {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'nicolas-gold-link-check/1.0' }
    };
    let respuesta = await fetch(enlace, { ...opciones, method: 'HEAD' });
    if (respuesta.status === 405 || respuesta.status === 403) {
      respuesta = await fetch(enlace, { ...opciones, method: 'GET' });
    }

    const estado = respuesta.status;
    const ok = estado >= 200 && estado < 400;
    console.log(`${ok ? '✓' : '✗'} ${estado} ${enlace}`);
    if (!ok) fallos += 1;
  } catch (error) {
    console.log(`✗ error ${enlace} — ${error.message}`);
    fallos += 1;
  }
}

if (enlaces.length === 0) {
  console.log('No hay enlaces de proyectos para verificar.');
}

if (fallos > 0) {
  console.error(`\n${fallos} enlace(s) con problemas.\n`);
  process.exit(1);
}

console.log('\nTodos los enlaces responden.\n');
