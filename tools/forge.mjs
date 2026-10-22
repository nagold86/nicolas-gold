#!/usr/bin/env node
/**
 * La Forja.
 *
 * Lee el registro de pergaminos y la plantilla, valida el dato y escribe
 * `dist/index.html` con las tarjetas ya renderizadas. Sin frameworks, sin
 * dependencias y sin contenido que dependa de JavaScript para existir.
 *
 * Uso: node tools/forge.mjs
 */

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(RAIZ, 'src');
const DIST = join(RAIZ, 'dist');
const DATA = join(RAIZ, 'data', 'projects.json');

const ESTADOS = new Set(['publicado', 'en-forja']);
const ARTES = new Set(['hoja', 'sello']);

function fallar(mensaje) {
  console.error(`\n  ✗ La forja se detuvo: ${mensaje}\n`);
  process.exit(1);
}

function leerOrigen() {
  const crudo = (process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '').trim();
  if (!crudo) return '';
  const conProtocolo = /^https?:\/\//i.test(crudo) ? crudo : `https://${crudo}`;
  return conProtocolo.replace(/\/+$/, '');
}

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caracter) => {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return mapa[caracter];
  });
}

function romanos(numero) {
  const tabla = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let resto = numero;
  let salida = '';
  for (const [valor, letra] of tabla) {
    while (resto >= valor) {
      salida += letra;
      resto -= valor;
    }
  }
  return salida;
}

function validarPergaminos(pergaminos) {
  if (!Array.isArray(pergaminos) || pergaminos.length === 0) {
    fallar('data/projects.json necesita al menos un pergamino.');
  }

  const vistos = new Set();

  pergaminos.forEach((p, indice) => {
    const donde = `pergamino #${indice + 1}`;

    if (!p || typeof p !== 'object' || Array.isArray(p)) {
      fallar(`${donde}: no es un objeto.`);
    }

    for (const campo of ['id', 'titulo', 'anio', 'estado', 'descripcion', 'tags', 'glifo', 'arte']) {
      if (p[campo] === undefined || p[campo] === null || p[campo] === '') {
        fallar(`${donde}: falta el campo obligatorio "${campo}".`);
      }
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(p.id))) {
      fallar(`${donde}: el id "${p.id}" no es un slug válido (minúsculas, números y guiones).`);
    }

    if (vistos.has(p.id)) {
      fallar(`${donde}: el id "${p.id}" está repetido.`);
    }
    vistos.add(p.id);

    if (typeof p.titulo !== 'string' || p.titulo.trim().length < 2 || p.titulo.length > 64) {
      fallar(`${donde}: el título debe tener entre 2 y 64 caracteres.`);
    }

    if (p.subtitulo !== undefined && (typeof p.subtitulo !== 'string' || p.subtitulo.length > 80)) {
      fallar(`${donde}: el subtítulo no puede superar los 80 caracteres.`);
    }

    if (!Number.isInteger(p.anio) || p.anio < 2000 || p.anio > 2100) {
      fallar(`${donde}: el año "${p.anio}" no es válido.`);
    }

    if (!ESTADOS.has(p.estado)) {
      fallar(`${donde}: el estado "${p.estado}" no es publicado ni en-forja.`);
    }

    if (typeof p.descripcion !== 'string' || p.descripcion.trim().length < 40 || p.descripcion.length > 260) {
      fallar(`${donde}: la descripción debe tener entre 40 y 260 caracteres.`);
    }

    if (!Array.isArray(p.tags) || p.tags.length < 1 || p.tags.length > 6) {
      fallar(`${donde}: tags debe ser una lista de 1 a 6 elementos.`);
    }
    p.tags.forEach((tag) => {
      if (typeof tag !== 'string' || tag.trim().length < 2 || tag.length > 28) {
        fallar(`${donde}: cada tag debe ser un texto de 2 a 28 caracteres.`);
      }
    });

    if (typeof p.glifo !== 'string' || [...p.glifo].length !== 1) {
      fallar(`${donde}: el glifo debe ser exactamente un carácter.`);
    }

    if (!ARTES.has(p.arte)) {
      fallar(`${donde}: arte debe ser "hoja" o "sello".`);
    }

    if (p.estado === 'publicado' && !p.href) {
      fallar(`${donde}: un pergamino publicado necesita un href verificable.`);
    }

    for (const campo of ['href', 'repo']) {
      if (p[campo] === undefined || p[campo] === null || p[campo] === '') continue;
      let url;
      try {
        url = new URL(p[campo]);
      } catch {
        fallar(`${donde}: ${campo} no es una URL válida.`);
      }
      if (url.protocol !== 'https:') {
        fallar(`${donde}: ${campo} debe usar https.`);
      }
    }

    if (p.destacado !== undefined && typeof p.destacado !== 'boolean') {
      fallar(`${donde}: destacado debe ser true o false.`);
    }

    if (p.cta !== undefined && (typeof p.cta !== 'string' || p.cta.length > 40)) {
      fallar(`${donde}: el cta no puede superar los 40 caracteres.`);
    }

    if (p.nota !== undefined && (typeof p.nota !== 'string' || p.nota.length > 120)) {
      fallar(`${donde}: la nota no puede superar los 120 caracteres.`);
    }
  });
}

function dibujoPara(pergamino, hoja, sello) {
  if (pergamino.arte === 'hoja') return hoja;
  return sello.replaceAll('{{GLIFO}}', escaparHtml(pergamino.glifo));
}

function renderPergamino(pergamino, indice, hoja, sello) {
  const numero = romanos(indice + 1);
  const idTitulo = `pergamino-${pergamino.id}-titulo`;
  const esEnlace = Boolean(pergamino.href);
  const esExterno = esEnlace && pergamino.href.startsWith('https://');
  const esPublicado = pergamino.estado === 'publicado';
  const etiqueta = esPublicado ? 'Publicado' : 'En forja';
  const chip = esPublicado ? 'chip--publicado' : 'chip--forja';
  const cta = pergamino.cta || (esPublicado ? 'Abrir el proyecto' : 'En preparación');

  const titulo = esEnlace
    ? `<a class="pergamino__enlace" id="${idTitulo}" href="${escaparHtml(pergamino.href)}"${esExterno ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escaparHtml(pergamino.titulo)}${esExterno ? '<span class="sr-only"> (se abre en una pestaña nueva)</span>' : ''}</a>`
    : `<span class="pergamino__enlace pergamino__enlace--quieto" id="${idTitulo}">${escaparHtml(pergamino.titulo)}</span>`;

  const llamada = esEnlace
    ? `<span class="pergamino__cta">${escaparHtml(cta)} <span aria-hidden="true">${esExterno ? '↗' : '→'}</span></span>`
    : `<span class="pergamino__cta pergamino__cta--quieta">${escaparHtml(cta)}</span>`;

  return `
        <article class="pergamino${pergamino.destacado ? ' pergamino--destacado' : ''}" data-arte="${pergamino.arte}" data-reveal aria-labelledby="${idTitulo}">
          <div class="pergamino__arte" aria-hidden="true">
            ${dibujoPara(pergamino, hoja, sello)}
            <span class="pergamino__barrido"></span>
          </div>
          <div class="pergamino__cuerpo">
            <header class="pergamino__meta">
              <span class="pergamino__numeral" aria-hidden="true">${numero}</span>
              <span class="pergamino__anio">${pergamino.anio}</span>
              <span class="chip ${chip}"><span class="chip__punto" aria-hidden="true"></span>${etiqueta}</span>
            </header>
            <h3 class="pergamino__titulo">${titulo}</h3>
            ${pergamino.subtitulo ? `<p class="pergamino__subtitulo">${escaparHtml(pergamino.subtitulo)}</p>` : ''}
            <p class="pergamino__desc">${escaparHtml(pergamino.descripcion)}</p>
            <ul class="pergamino__tags" aria-label="Herramientas del proyecto">${pergamino.tags.map((tag) => `<li>${escaparHtml(tag)}</li>`).join('')}</ul>
            ${pergamino.nota ? `<p class="pergamino__nota">${escaparHtml(pergamino.nota)}</p>` : ''}
            ${llamada}
          </div>
        </article>`;
}

function renderProximo(indice, sello) {
  const numero = romanos(indice + 1);
  const idTitulo = 'pergamino-proximo-titulo';
  return `
        <article class="pergamino pergamino--proximo" data-arte="sello" data-reveal aria-labelledby="${idTitulo}">
          <div class="pergamino__arte" aria-hidden="true">
            ${sello.replaceAll('{{GLIFO}}', '✦')}
            <span class="pergamino__barrido"></span>
          </div>
          <div class="pergamino__cuerpo">
            <header class="pergamino__meta">
              <span class="pergamino__numeral" aria-hidden="true">${numero}</span>
              <span class="pergamino__anio" aria-hidden="true">—</span>
              <span class="chip chip--forja"><span class="chip__punto" aria-hidden="true"></span>En forja</span>
            </header>
            <h3 class="pergamino__titulo"><a class="pergamino__enlace" id="${idTitulo}" href="#senal">El próximo pergamino</a></h3>
            <p class="pergamino__subtitulo">Todavía en blanco</p>
            <p class="pergamino__desc">Si tenés una pregunta que valga la pena medir, la puerta está abierta. El próximo proyecto puede empezar con tu idea.</p>
            <ul class="pergamino__tags" aria-label="Estado del proyecto"><li>En preparación</li><li>Tu pregunta</li></ul>
            <span class="pergamino__cta">Proponer una pregunta <span aria-hidden="true">→</span></span>
          </div>
        </article>`;
}

async function principal() {
  let crudo;
  try {
    crudo = await readFile(DATA, 'utf8');
  } catch {
    fallar('no encontré data/projects.json.');
  }

  let datos;
  try {
    datos = JSON.parse(crudo);
  } catch (error) {
    fallar(`data/projects.json no es JSON válido: ${error.message}`);
  }

  validarPergaminos(datos.pergaminos);

  datos.pergaminos.sort((a, b) => {
    const estado = (a.estado === 'publicado' ? 0 : 1) - (b.estado === 'publicado' ? 0 : 1);
    if (estado !== 0) return estado;
    const destacado = Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
    if (destacado !== 0) return destacado;
    if (a.anio !== b.anio) return b.anio - a.anio;
    return a.titulo.localeCompare(b.titulo, 'es');
  });

  const hoja = await readFile(join(SRC, 'parts', 'hoja.svg'), 'utf8');
  const sello = await readFile(join(SRC, 'parts', 'sello.svg'), 'utf8');

  let plantilla;
  try {
    plantilla = await readFile(join(SRC, 'index.html'), 'utf8');
  } catch {
    fallar('no encontré src/index.html.');
  }

  if (!plantilla.includes('<!-- @pergaminos -->')) {
    fallar('src/index.html no tiene el marcador <!-- @pergaminos -->.');
  }

  const tarjetas = datos.pergaminos
    .map((pergamino, indice) => renderPergamino(pergamino, indice, hoja, sello))
    .join('\n');
  const proximo = renderProximo(datos.pergaminos.length, sello);
  const anio = new Date().getFullYear();
  const origen = leerOrigen();
  const canonical = origen
    ? `<link rel="canonical" href="${origen}/">\n  <meta property="og:url" content="${origen}/">`
    : '';

  const html = plantilla
    .replace('<!-- @pergaminos -->', `${tarjetas}\n${proximo}`)
    .replace('<!-- @canonical -->', canonical)
    .replaceAll('{{ORIGEN}}', origen)
    .replaceAll('<!-- @anio -->', String(anio));

  if (html.includes('<!-- @')) {
    console.warn('  · Quedaron marcadores sin reemplazar en la plantilla.');
  }

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await cp(join(SRC, 'styles'), join(DIST, 'styles'), { recursive: true });
  await cp(join(SRC, 'js'), join(DIST, 'js'), { recursive: true });
  await cp(join(RAIZ, 'assets'), join(DIST, 'assets'), { recursive: true });
  await writeFile(join(DIST, 'index.html'), html, 'utf8');
  await writeFile(join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');

  console.log('\n  ✦ Forja completa');
  console.log(`    ${datos.pergaminos.length} pergamino(s) publicado(s) · 1 en forja`);
  console.log('    dist/index.html listo\n');
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
