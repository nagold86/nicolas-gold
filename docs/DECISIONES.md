# Decisiones — landing de Nicolás Gold

Registro breve de las decisiones que sostienen el sitio. Cada una dice qué se
eligió, por qué y qué se descartó. Si una decisión cambia, se agrega otra entrada
en vez de reescribir la historia.

## ADR-001 · Sitio estático con forja propia

**Contexto.** Una landing personal, un solo HTML, sin formularios ni datos de
usuario. Necesita verse igual dentro de cinco años y no arrastrar dependencias.

**Decisión.** HTML, CSS y dos módulos ES sin dependencias. Un script de build
(`tools/forge.mjs`) hornea las tarjetas de proyecto y los metadatos en
`dist/index.html`.

**Consecuencias.** El repositorio no tiene `node_modules`; el deploy no instala
nada; cualquier editable se resuelve con `npm run build`.

**Descartado.** Next.js/Astro para una página: peso de toolchain y superficie de
actualización sin beneficio. Handlebars o EJS: la forja cabe en una función.

## ADR-002 · Vercel como destino único

**Contexto.** El pedido incluye publicar en Vercel y el proyecto ya tiene otros
trabajos desplegados allí.

**Decisión.** `vercel.json` fija `buildCommand: node tools/forge.mjs`,
`outputDirectory: dist`, `cleanUrls` y cabeceras de caché y seguridad. Sin
framework, sin funciones serverless.

**Consecuencias.** El deploy es reproducible y barato. CSP permite solo Google
Fonts; los assets propios son locales.

**Descartado.** Publicar `src/` directo: expondría la forja y los archivos de
trabajo. Un servidor Node: no hay nada que servir en caliente.

## ADR-003 · El contenido no depende del JavaScript

**Contexto.** Los fuegos son el alma del sitio, pero no pueden ser la puerta de
entrada al contenido.

**Decisión.** Las tarjetas, los textos y los enlaces existen en el HTML del
build. El menú móvil usa `<details>`. Los módulos de JS solo agregan
comportamiento; si fallan, la página sigue legible.

**Consecuencias.** La lupa verifica que sin JS haya al menos dos tarjetas y que
no haya errores de consola. Los fuegos muestran un aviso discreto en `<noscript>`.

**Descartado.** Renderizar todo en cliente: una landing no necesita hidratación.

## ADR-004 · Un solo sistema visual

**Contexto.** Diez agentes, un solo sitio. Sin una fuente única, el diseño se
desarma en la tercera sección.

**Decisión.** `src/styles/tokens.css` concentra color, tipografía, espacio,
movimiento y capas. `styles.css` solo consume variables. Celebrimbor firma.

**Consecuencias.** Cambiar la identidad es cambiar un archivo. La lupa detecta
desbordes y contrastes, no valores sueltos: la revisión es por lectura de CSS.

**Descartado.** Utilidades tipo Tailwind: el proyecto no quiere toolchain ni
clases de diseño en el HTML.

## ADR-005 · Motor de fuegos propio, con presupuesto

**Estado.** Reemplazada por ADR-014: la identidad diurna no usa fuegos.

**Contexto.** La referencia son los fuegos de Gandalf: luz viva, no un video ni
un GIF. Debía funcionar sin librerías y sin castigar el teléfono.

**Decisión.** Canvas 2D con cuatro tipos (peonía, sauce, anillo, chispa), mezclas
de oro, plata, musgo y brasa, semilla fija `mulberry32`, DPR máximo 1.75,
2.2 MP y techo de partículas. El bucle se detiene solo y se pausa con la pestaña
oculta.

**Consecuencias.** La misma visita dibuja el mismo cielo. El costo de CPU queda
acotado y verificable en el código.

**Descartado.** Three.js, partículas en CSS o video de fondo: peso, opacidad al
sistema y menos control del color.

## ADR-006 · El fuego pasa por detrás de las palabras

**Estado.** Reemplazada por ADR-015.

**Contexto.** Los primeros estallidos cruzaban títulos y notas. La lectura no se
negocia.

**Decisión.** `--z-fuego: 2` queda debajo de `--z-contenido: 3`. Además, el
origen se elige entre 24 candidatos de los márgenes, rechazando los que caen
dentro de zonas protegidas (`data-escudo`, `data-zona-segura`, fichas, cartas,
pergaminos, equipaje) infladas por 132 px (96 px en móvil). Se maximiza la
distancia mínima; si no hay margen limpio, se usa el de mayor distancia total.

**Consecuencias.** El fuego se lee alrededor de las letras, nunca encima. La
señal conserva su estallido al costado del titular y la nota queda limpia.

**Descartado.** Bajar la opacidad de todo el fuego para disimular cruces: apaga
la metáfora sin resolver el problema.

## ADR-007 · En móvil, menos estallidos

**Estado.** Reemplazada por ADR-015.

**Contexto.** En 390 px no hay margen seguro: cualquier explosión automática cae
sobre el texto.

**Decisión.** En móvil no hay estallidos por sección. Queda una chispa de
bienvenida en la esquina superior derecha y las chispas que dispara el visitante
al tocar la portada.

**Consecuencias.** Se conserva el gesto y se protege la lectura. El escritorio
mantiene una pasada por sección.

**Descartado.** Explosiones minúsculas en los bordes: se confunden con suciedad
del fondo.

## ADR-008 · Menos movimiento es una postal, no una página vacía

**Estado.** Reemplazada por ADR-015.

**Contexto.** `prefers-reduced-motion` no puede degradar el contenido.

**Decisión.** Se pinta una postal estática con halo y corona de puntos; se
ocultan las pistas de interacción; el revelado no arma elementos y todo el
contenido queda visible.

**Consecuencias.** La lupa corre un escenario `reduce` y otro sin JS; ambos
muestran el texto completo.

## ADR-009 · El Sendero, no “experiencia laboral”

**Contexto.** El pedido fue explícito: la trayectoria existe, el rótulo de
recursos humanos no.

**Decisión.** La sección II se llama **El Sendero**; cada parada es una **posta**
con año, lugar, rol y un relato breve. La expresión “experiencia laboral” no
aparece en pantalla ni en metadatos.

**Consecuencias.** El contenido respeta el CV: Farmacity, Lightech, Stefanini,
Acciona (analista funcional y operaciones), con `19 años y 10 meses` de oficio
—no veinte— y la tecnicatura **en curso** hasta diciembre de 2026.

**Descartado.** Una lista de bullets con fechas: repite el CV y no cuenta nada.

## ADR-010 · Proyectos desde un archivo, con lugar para el próximo

**Contexto.** Hoy hay un proyecto y habrá más. Agregar uno no debería tocar el
HTML.

**Decisión.** `data/projects.json` define los proyectos publicados y “en forja”.
La forja genera las tarjetas con estado, año y acceso. La tarjeta “El próximo
pergamino” ocupa el lugar libre.

**Consecuencias.** Para publicar otro proyecto alcanza con editar el JSON y
volver a construir. La tarjeta en forja no promete fechas.

**Descartado.** Un CMS: más superficie que contenido.

## ADR-011 · Metadatos con origen en el build

**Contexto.** Open Graph exige URL absoluta y el dominio no se conoce hasta el
deploy.

**Decisión.** La forja lee `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL`, arma
el origen y reemplaza `{{ORIGEN}}` en canonical, `og:url` y `og:image`. En local
quedan rutas relativas.

**Consecuencias.** La tarjeta social funciona en producción sin hardcodear el
dominio. `assets/og.png` se regenera con `npm run og` (Edge headless, 1200×630)
y se versiona.

**Descartado.** Dominio fijo: se rompe en previews y en el primer deploy.

## ADR-012 · La lupa no se publica

**Contexto.** Hacía falta ver la página como la ve un visitante, no como la
describe el código.

**Decisión.** `tools/audit.mjs` abre Edge headless por CDP, emula 15 escenarios
(escritorio, móvil, 320 px, altura 800, movimiento reducido, sin JS), guarda
capturas en `.qa/` y falla ante errores de consola, desborde horizontal o
tarjetas ausentes sin JS. `.qa/` se ignora en git y en Vercel.

**Consecuencias.** Cada cambio visual se puede verificar dos veces: por lectura y
por captura. El veredicto sigue siendo de Boromir.

**Descartado.** Playwright o Lighthouse como dependencia: el proyecto no quiere
`node_modules` para una herramienta de taller.

## ADR-013 · Sin números que no se puedan defender

**Contexto.** La tentación de inflar métricas en una landing es real.

**Decisión.** Se publica lo que el CV sostiene: años de oficio, roles, estudios
en curso y un enlace verificado a la demo de El Libro de las Hojas. No hay
porcentajes inventados ni clientes que no existan.

**Consecuencias.** El texto envejece bien. La demo se presenta con su límite:
el almacenamiento es efímero.

**Descartado.** “+2000 imágenes procesadas” como cifra de portada: pertenece al
proyecto, no al perfil, y sin contexto se lee como marketing.

## ADR-014 · De Cielo de Tinta a Comarca de Luz

**Contexto.** El contenido y la estructura estaban aprobados; el diseño nocturno
no. El pedido fue un día soleado en la Comarca: colores claros, río, árboles y
bosque, sin tocar el texto ni el orden de las secciones.

**Decisión.** Se reemplaza la capa visual completa por una identidad diurna:
cielo, sol, colinas, bosque y río en la portada; papel cálido para la lectura;
bosque profundo solo en El Sendero y en el pie. El contenido, los ids, la
navegación y el contrato de datos quedan intactos. Los tokens se renombran a
cielo, papel, bosque, hoja, río y miel.

**Consecuencias.** Los pares de contraste se midieron de nuevo; el sello, el
favicon y la tarjeta social se redibujaron en clave diurna. El sitio conserva la
misma estructura de forja y los mismos estados.

**Descartado.** Aclarar solo las secciones y dejar la portada nocturna: dos
identidades conviviendo. Fondos fotográficos: dependencia externa y ruido bajo el
texto. Assets de las películas: prohibido por el mandato.

## ADR-015 · Animación en capas, con presupuesto y apagado

**Contexto.** Hacía falta que el paisaje se moviese —río, hojas, brisa, paralaje—
sin castigar la lectura ni la batería, y con una salida limpia para quien pide
menos movimiento.

**Decisión.** Tres capas con responsabilidades separadas:

1. **CSS** para el ambiente continuo: rayos con `repeating-conic-gradient`,
nubes con traslación alterna, copas con `transform-box: fill-box` y el río con
`pathLength="1"` y `stroke-dashoffset`.
2. **Canvas 2D** (`src/js/comarca.js`) para polen y hojas, con DPR máximo 2 y
2.4 MP de techo.
3. **Una variable CSS** (`--avance`) para el paralaje, escrita desde un solo
`requestAnimationFrame`.

El bucle se detiene con IntersectionObserver cuando la portada sale de pantalla
y con `visibilitychange` cuando la pestaña se oculta. Con
`prefers-reduced-motion: reduce` no se inicializa el canvas, se ocultan las
pistas y la escena queda como postal.

**Consecuencias.** La animación no bloquea el contenido ni mueve layout: solo
transforma, opacidad o trazo. La pista de brisa se esconde en pantallas bajas y
solo aparece con JS.

**Descartado.** Un canvas fijo a pantalla completa: gasta batería fuera de la
portada. Librerías de animación o video en loop: peso y menos control del color.
Animar `top`, `left` o `width`: obliga a recalcular layout en cada cuadro.

## ADR-016 · El pie de portada se protege con un velo, no con una promesa

**Contexto.** Con la escena detrás, el pie de la portada puede caer sobre
cualquier colina según el alto de la ventana. `--crema-tenue` sobre
`--colina-sombra` mide 4.20 y no cumple AA.

**Decisión.** El pie usa `--crema` y se apoya en `--velo-pie`, un degradado a
bosque en los últimos `clamp(8rem, 22vh, 13rem)` de la portada. El dato técnico
usa `--crema-tenue` al 82 % (6.94 sobre bosque). Los pares se verifican con
`npm run contraste` y el par prohibido queda documentado en `DESIGN.md`.

**Consecuencias.** El pie cumple AA en cualquier alto de ventana sin agregar una
barra sólida. La escena se oscurece solo en el borde inferior, donde no hay
contenido que leer salvo el propio pie.

**Descartado.** Mover el pie a una barra fija: suma peso visual y compite con la
portada. Cambiar el color del texto: falla en otro fondo. Acortar el héroe: pierde
el paisaje.

