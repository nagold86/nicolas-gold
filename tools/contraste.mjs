#!/usr/bin/env node
/**
 * La balanza de Celebrimbor.
 *
 * Mide los pares de contraste WCAG 2.2 que el sitio usa de verdad, incluidos
 * los textos con opacidad, que se componen sobre su fondo antes de medir.
 *
 * Uso: node tools/contraste.mjs
 */

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const L = (h) => {
  const [r, g, b] = rgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const x = L(a);
  const y = L(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const overlay = (fg, bg, alpha) => {
  const F = rgb(fg);
  const B = rgb(bg);
  const out = F.map((v, i) => Math.round(v * alpha + B[i] * (1 - alpha)));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
};

const T = {
  cieloAlto: '#F0F9F3', cieloBajo: '#C9E3D5',
  papel: '#FBF5E5', papelAlto: '#FFFBEF', pradera: '#E9F1DB',
  crema: '#FAF3DE', cremaTenue: '#E7DFC8',
  tinta: '#1E2F22', tintaSuave: '#45553F', tintaTenue: '#5E6C57',
  bosque: '#21382A', bosqueAlto: '#2E4A35', bosqueBajo: '#16261C',
  hoja: '#5B8A43', hojaOscura: '#3D6732', hojaClara: '#8FB56A',
  colinaCerca: '#5F8C4D', colinaSombra: '#487241',
  miel: '#D9A03C', mielClaro: '#F2C978', mielHondo: '#7A5314',
  terracota: '#B9613C', foco: '#2C6B66',
};

const pares = [
  ['tinta', 'papel', 'texto principal'],
  ['tinta', 'papelAlto', 'texto sobre ficha'],
  ['tintaSuave', 'papel', 'texto secundario'],
  ['tintaTenue', 'papel', 'texto tenue'],
  ['tintaTenue', 'pradera', 'texto tenue sobre pradera'],
  ['tinta', 'cieloAlto', 'portada'],
  ['tintaSuave', 'cieloAlto', 'portada secundario'],
  ['hojaOscura', 'papel', 'acento verde'],
  ['mielHondo', 'papelAlto', 'dato dorado'],
  ['crema', 'bosque', 'pie'],
  ['crema', 'bosqueAlto', 'pie alto'],
  ['cremaTenue', 'bosque', 'pie tenue'],
  ['cremaTenue', 'colinaSombra', 'pie sobre colina (prohibido como texto)'],
  ['mielClaro', 'bosque', 'enlace del pie'],
  ['mielClaro', 'bosqueAlto', 'sello'],
  ['foco', 'cieloAlto', 'anillo de foco'],
  ['foco', 'papel', 'anillo de foco en papel'],
  ['terracota', 'papel', 'filete de lesión (no texto)'],
];

let fallos = 0;
for (const [fg, bg, uso] of pares) {
  const r = ratio(T[fg], T[bg]);
  if (uso.includes('prohibido')) {
    console.log(`REF   ${r.toFixed(2).padStart(5)}  ${uso}  (${fg} / ${bg})`);
    continue;
  }
  const minimo = uso.includes('no texto') ? 3 : 4.5;
  const ok = r >= minimo;
  if (!ok) fallos += 1;
  console.log(`${ok ? 'OK ' : 'FALLA'}  ${r.toFixed(2).padStart(5)}  ${uso}  (${fg} / ${bg})`);
}

// Texto con opacidad: se compone sobre el fondo antes de medir.
const opacidades = [
  ['cremaTenue', 'bosque', 0.82, 'pie técnico'],
  ['crema', 'bosque', 0.92, 'dato del pie de portada'],
];
for (const [fg, bg, a, uso] of opacidades) {
  const compuesto = overlay(T[fg], T[bg], a);
  const r = ratio(compuesto, T[bg]);
  const ok = r >= 4.5;
  if (!ok) fallos += 1;
  console.log(`${ok ? 'OK ' : 'FALLA'}  ${r.toFixed(2).padStart(5)}  ${uso} al ${a * 100}% (${compuesto} / ${bg})`);
}

console.log(fallos === 0 ? '\nTodos los pares en uso cumplen AA.' : `\n${fallos} par(es) por debajo de AA.`);
process.exitCode = fallos === 0 ? 0 : 1;
