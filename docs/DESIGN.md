# Diseño — Comarca de Luz

Identidad visual de la landing personal de Nicolás Gold. La firma es de
**Celebrimbor**; el método lo arbitró **Gandalf**; la estructura la sostuvo
**Aragorn**. Este documento no se publica: vive en el repo, se ignora en Vercel.

## 1. Concepto

Un día soleado en la Comarca. La página es un cuaderno de campo abierto sobre la
pradera: cielo claro, sol alto, colinas escalonadas, un río que corre y bosque en
el horizonte. El contenido no se apoya en una viñeta: se apoya en luz.

La metáfora ordena la jerarquía. El cielo y el paisaje son atmósfera (capa 0 y
1); el pergamino es el contenido (capa 2); la miel es estructura (filetes,
sellos, datos), nunca la tinta de un párrafo.

## 2. Las cinco estaciones

| Nº | Sección | Pregunta que responde | Material |
|---|---|---|---|
| — | Portada | Quién es y qué hace | Cielo, sol, colinas, río, árboles en primer plano |
| I | Prefacio | Cómo mira el oficio | Prosa sobre papel cálido y ficha de oficio |
| II | El Sendero | De dónde viene | Bosque profundo, línea de postas |
| III | El Equipaje | Con qué trabaja | Banda de papel, columnas con numeral |
| IV | Los Pergaminos | Qué construyó | Tarjetas de proyecto sobre pradera |
| V | La Señal | Cómo se lo encuentra | Cielo que baja a papel, carta de contacto |

El Sendero es el nombre canónico de la trayectoria. “Experiencia laboral” no
aparece en pantalla ni en metadatos: el rótulo visible es **El Sendero** y cada
parada se llama **posta**.

## 3. Materiales y tokens

Todo color, tipo, espacio y movimiento sale de `src/styles/tokens.css`. No hay
valores literales de diseño fuera de ese archivo: los velos, sombras y filtros
también son tokens (`--velo-pie`, `--sombra-texto`, `--sombra-copa`).

### Cielo y luz

| Token | Valor | Uso |
|---|---|---|
| `--cielo-alto` | `#F0F9F3` | Arriba del degradado, `theme-color` |
| `--cielo` | `#DCEFE3` | Medio del cielo |
| `--cielo-bajo` | `#C9E3D5` | Horizonte |
| `--bruma` | `#F6FAF2` | Nubes y velos suaves |
| `--sol` | `#F2BE58` | Disco y rayos |
| `--sol-claro` | `#FBE2A0` | Núcleo del sol |
| `--resplandor-sol` | `rgba(242,190,88,.5)` | Halo |

### Papel y pradera

| Token | Valor | Uso |
|---|---|---|
| `--papel` | `#FBF5E5` | Fondo de secciones |
| `--papel-alto` | `#FFFBEF` | Fichas y tarjetas |
| `--papel-hondo` | `#F3E8D1` | Banda de equipaje |
| `--papel-sombra` | `#E4D4B3` | Bordes de papel |
| `--pradera` | `#E9F1DB` | Fondo de pergaminos |
| `--crema` | `#FAF3DE` | Texto sobre bosque |
| `--crema-tenue` | `#E7DFC8` | Dato secundario sobre bosque |

### Tinta, bosque y río

| Token | Valor | Uso |
|---|---|---|
| `--tinta` | `#1E2F22` | Texto principal |
| `--tinta-suave` | `#45553F` | Texto secundario |
| `--tinta-tenue` | `#5E6C57` | Rótulos y notas |
| `--bosque` | `#21382A` | Fondo de El Sendero y pie |
| `--bosque-alto` | `#2E4A35` | Copas |
| `--bosque-bajo` | `#16261C` | Profundidad |
| `--hoja` | `#5B8A43` | Verde de acción |
| `--hoja-oscura` | `#3D6732` | Acento legible sobre papel |
| `--hoja-clara` | `#8FB56A` | Luz en las copas |
| `--colina-lejos` | `#BCD5B0` | Primera colina |
| `--colina-lejos-2` | `#A8C99B` | Segunda colina |
| `--colina-medio` | `#84AC73` | Colina media |
| `--colina-cerca` | `#5F8C4D` | Colina próxima |
| `--colina-sombra` | `#487241` | Bosque y sombra de orilla |
| `--rio` | `#2F7F77` | Cauce |
| `--rio-claro` | `#78BCAF` | Naciente |
| `--rio-hondo` | `#235F5A` | Profundidad del cauce |
| `--rio-brillo` | `#E6F7F0` | Hilos de corriente |

### Miel, lesión y foco

| Token | Valor | Uso |
|---|---|---|
| `--miel` | `#D9A03C` | Filetes y detalles |
| `--miel-claro` | `#F2C978` | Enlace del pie, sello |
| `--miel-hondo` | `#7A5314` | Dato dorado sobre papel |
| `--terracota` | `#B9613C` | Lesión, solo filete sobre papel |
| `--terracota-hondo` | `#96482B` | Lesión sobre papel alto |
| `--foco` | `#2C6B66` | Anillo de foco sobre claro |
| `--foco-claro` | `#F2C978` | Anillo de foco sobre bosque |

### Contraste medido (WCAG 2.2)

| Par | Ratio | Veredicto |
|---|---|---|
| tinta / papel | 12.99 | AA y AAA |
| tinta / cielo-alto | 13.17 | AA y AAA |
| tinta-suave / papel | 7.35 | AA y AAA |
| crema / bosque | 11.38 | AA y AAA |
| crema-tenue / bosque | 9.49 | AA |
| miel-claro / bosque | 8.05 | AA |
| miel-hondo / papel-alto | 6.60 | AA |
| hoja-oscura / papel | 6.06 | AA |
| foco / cielo-alto | 5.75 | AA (no texto 3:1) |
| tinta-tenue / papel | 5.13 | AA |
| tinta-tenue / pradera | 4.81 | AA (al límite) |
| terracota / papel | 3.99 | Solo filete (3:1) |
| crema-tenue / colina-sombra | 4.20 | **Prohibido como texto** |

`--crema-tenue` nunca se apoya sobre `--colina-sombra`. El pie de portada se
protege con `--velo-pie`, un degradado a bosque que garantiza el par 11.38 sin
importar qué colina quede detrás. El dato técnico del pie usa `--crema-tenue` al
82 %: 6.94 sobre bosque.

## 4. Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Título | Cinzel | Nombre, títulos de sección, cifras romanas |
| Cuerpo | EB Garamond | Prosa, ledes, relatos |
| Dato | IBM Plex Mono | Rótulos, fechas, coordenadas, unidades |

Escala fluida `--t-12` a `--t-96`; medida de lectura 62ch; interlineado 1.65.
El titular de portada se limita a `min(--t-96, 10.5vh)` para que el héroe entre
en pantallas de 800 px de alto sin perder el “Bajá”.

## 5. Movimiento

El paisaje respira; nunca compite con la lectura. Toda la animación vive dentro
de `[data-comarca]`, detrás del contenido (`--z-escena: 0`, `--z-brisa: 1`,
`--z-contenido: 2`).

### Capa CSS: ambiente continuo

| Pieza | Técnica | Ritmo |
|---|---|---|
| Rayos del sol | `repeating-conic-gradient` con máscara radial, rotación continua | `--t-girar: 180s` |
| Nubes | Dos radial-gradient elípticos, traslación alterna | 24–38 s |
| Copas de árbol | `transform-box: fill-box` + `transform-origin: 50% 100%` + rotación de 0.5° | `--t-mecer: 9s` |
| Río | `pathLength="1"` + `stroke-dasharray: .16 .84` + `stroke-dashoffset` animado | 9–17 s por hilo |
| Paralaje | Una variable `--avance` (0–1) aplicada a sol, nubes, paisaje y árboles | rAF |

`transform-box: fill-box` permite girar cada copa desde su propia base sin
`transform-origin` en píxeles. `pathLength="1"` normaliza el largo del río para
que todos los hilos compartan el mismo ciclo sin medir el path.

`--avance` y el avance de lectura no se escriben como estilo en línea: la CSP
(`style-src` sin `'unsafe-inline'`) los bloquearía. `src/js/regla.js` inserta una
regla en la hoja propia y actualiza su declaración; el navegador la trata como
CSS de autor.

### Capa canvas: brisa

`src/js/comarca.js` dibuja polen que sube y hojas que bajan sobre `#brisa`.

- Presupuesto: DPR máximo 2 y 2.4 MP; densidad de partículas proporcional al
  ancho (10–32 motas, 3–9 hojas).
- Un solo `requestAnimationFrame`; se detiene con IntersectionObserver cuando la
  portada sale de pantalla y con `visibilitychange` cuando la pestaña se oculta.
- `pointerdown` en la portada levanta una ráfaga de 11–15 hojas; el botón de
  pista lanza 22. El botón no existe si no hay JS (`hidden`).
- `prefers-reduced-motion`: no se inicializa el canvas, se oculta `#brisa` y la
  pista, y toda la escena queda como postal estática.

### Lo que se evitó

- Animar `top`, `left` o `width`: todo es `transform`, `opacity` o `stroke-dashoffset`.
- Un canvas fijo a pantalla completa: la brisa vive en la portada y se apaga al
  salir, para no gastar batería en móvil.
- Bucles que corren con la pestaña oculta o con movimiento reducido.
- Profundidad falsa con `filter: blur()` en capas grandes: el desenfoque se
  resuelve con opacidad y color de colina.

Referencias de método: MDN (`transform-box`, `pathLength`,
`prefers-reduced-motion`, Web Animations), web.dev (animaciones y rendimiento,
respeto por las preferencias de movimiento) y WCAG 2.2 (2.3.3 Animación por
interacción, 2.2.2 Pausar, detener, ocultar).

## 6. Componentes

- **Sello NG**: monograma en SVG con leyenda circular y chispa inferior; ancla
  visual de la portada y de la carta.
- **Botón hoja**: píldora verde con texto crema; filete para la acción
  secundaria. Foco visible de 3 px con offset.
- **Pista de brisa**: botón de papel con filete de miel que aparece solo con JS;
  desaparece en pantallas bajas para no empujar el héroe.
- **Posta**: año en dato, punto sobre la línea y relato a la derecha; en móvil la
  línea pasa a la izquierda.
- **Oficio**: cuatro columnas con numeral; sin iconos, el texto sostiene.
- **Pergamino**: tarjeta de proyecto con cabecera ilustrada, estado
  (`Publicado` / `En forja`) y acceso a la demo. Se genera en la forja desde
  `data/projects.json`; la tarjeta “El próximo pergamino” ocupa el lugar libre.
- **Carta**: panel de papel con sello, correo, botón de copiar y LinkedIn. El
  botón de copiar solo aparece si existe `navigator.clipboard`.

## 7. Accesibilidad

- Enlace de salto, foco visible, `aria-current="location"` en la navegación y
  `aria-live` para el estado de copiado.
- Escena y canvas son decorativos: `aria-hidden="true"`, sin foco.
- Menú móvil con `<details>` nativo; se cierra con Escape, con clic afuera y al
  elegir un enlace.
- Reflujo sin desborde horizontal desde 320 px, medido con la lupa.
- Sin JavaScript se lee todo: las tarjetas se hornean en build, el menú sigue
  funcionando y la pista de brisa no se muestra.
- Contraste AA verificado con `npm run contraste` (`tools/contraste.mjs`);
  ninguna métrica se reemplaza por un adorno.

## 8. Responsive

Cortes principales: 1040 px (grilla del prefacio), 900 px (navegación a menú),
640 px (móvil: sin pie de portada, sin pista de brisa), 380 px (marca compacta).
Por altura, 820 px y 700 px recortan pista y epígrafe para que el héroe no
desborde. El ancho máximo de lectura es 1180 px. La cabecera siempre lleva velo
de cielo para no depender del scroll ni del JS.

## 9. Handoff

- **Aragorn**: `#portada`, `.portada__interior`, `[data-comarca]`, `#brisa`,
  `[data-chispa]`; contrato de estados vacío / cargando / error / resultado.
- **Legolas y Gimli** (`core/render.py`): lesión `--terracota` / `--terracota-hondo`,
  nervadura `--hoja-oscura`, incertidumbre con opacidad; siempre sobre la hoja.
- **Merry**: paleta categórica derivada de `--hoja`, `--miel`, `--rio`,
  `--terracota`; nada fuera de tokens.
- **Boromir**: esta checklist y `npm run contraste` son el veredicto visual.

## 10. Firma

Celebrimbor responde por la identidad y los overlays; Sam por la luz y la
limpieza del cielo; Legolas por las máscaras de la hoja; Frodo por la
trazabilidad de las imágenes; Gimli y Merry por las medidas que se muestran;
Boromir por el veredicto; Pippin por romperla antes que el visitante; Gandalf por
el método; Aragorn por el conjunto.
