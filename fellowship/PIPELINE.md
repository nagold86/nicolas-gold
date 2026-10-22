# Contrato de arquitectura — Fellowship

Adaptación del [template del TP2](../tp-2/docs/TEMPLATE-PROYECTO.md) al análisis
de hojas de tabaco. Es de cumplimiento obligatorio para los diez agentes —los
nueve de la Comunidad más Celebrimbor, el aliado de diseño—: define quién
orquesta, qué archivo le pertenece a cada uno y qué está prohibido.

## 1. Quién orquesta

Hay dos niveles de orquestación y pertenecen a la misma persona, **Aragorn**:

| Nivel | Dónde | Qué hace |
|---|---|---|
| Agentes | conversación / reparto de trabajo | Decide el orden, convoca especialistas, cierra conflictos de interfaz |
| Código | `core/orchestrator.py` (`LeafInspector`) | Ejecuta aislamiento → preproceso → calidad → dominio → segmentación → morfometría → descriptores y devuelve un `InspectionResult` |

Nadie más orquesta:

- **Gandalf** decide el método y escribe ADRs; no ejecuta ni encadena etapas.
- **Boromir** audita el resultado; no llama etapas, solo emite veredicto.
- **La capa HTTP no orquesta.** El router valida, delega en `LeafInspector` y
  persiste. Nunca llama a `preprocess`, `segmentation` ni `descriptors` por su
  cuenta.
- **Pippin** corre experimentos aislados en `sandbox/`; no participa del flujo.
- **Celebrimbor** diseña la capa visual y firma los overlays; no mide, no
  segmenta y no altera el contrato HTTP.

Regla de oro: una sola clase compone el pipeline, y esa clase se instancia con
estrategias inyectables (`LeafInspector(preprocessor=..., segmenter=..., ...)`).

## 2. Layout y dueño de cada archivo

```
Fellowship/
├── imgs/                        dataset crudo, solo lectura           (dado)
├── core/                        librería pura, sin FastAPI ni app/
│   ├── __init__.py              fachada pública                      aragorn
│   ├── exceptions.py            jerarquía de errores de dominio      aragorn
│   ├── io.py                    único punto imagen ↔ mundo exterior  frodo
│   ├── isolation.py             hoja vs fondo + recorte            legolas
│   ├── preprocess.py            ABC + normalización, color, ruido    sam
│   ├── segmentation.py          ABC + lesiones, manchas, nervaduras  legolas
│   ├── morphometry.py           ABC + medidas de defectos            gimli
│   ├── descriptors.py           ABC + color y textura                merry
│   ├── quality.py               reglas de imagen inutilizable        boromir
│   ├── domain.py                compuerta de dominio (¿es hoja?)     boromir
│   ├── render.py                overlay de máscaras sobre la hoja   celebrimbor
│   ├── pipeline.py              composición de pasos + factory       aragorn
│   ├── orchestrator.py          LeafInspector + InspectionResult     aragorn
│   └── __main__.py              CLI sobre la misma fachada           aragorn
├── app/                         capa HTTP. Conoce el core; el core no la conoce
│   ├── main.py                  FastAPI, lifespan, estáticos         aragorn
│   ├── config.py                todo os.environ en un solo lugar     aragorn
│   ├── schemas.py               contrato con cliente y tests         aragorn
│   ├── errors.py                dominio → HTTP, mapeo declarativo    aragorn
│   ├── uploads.py               validación del archivo subido        frodo
│   ├── repository.py            persistencia detrás de interfaz      frodo
│   ├── reporting.py             agregación del lote, sin dibujar     aragorn
│   ├── routers/inspections.py   1 recurso, sin lógica de dominio     aragorn
│   └── routers/reports.py       informe agregado de solo lectura     aragorn
├── tests/
│   ├── conftest.py              aísla storage ANTES de importar app  boromir
│   ├── test_architecture.py     core no importa FastAPI ni app       boromir
│   ├── test_contract.py         la consigna en forma ejecutable      boromir
│   ├── golden/                  imágenes y anotaciones de referencia  boromir
│   └── test_<módulo>.py         unitarios del core                   dueño del módulo
├── docs/
│   ├── DECISIONES.md            registro de ADRs (1 sección cada una) gandalf
│   ├── CONVENCIONES.md          idioma, nombres, commits              gandalf
│   ├── DESIGN.md                identidad, tokens, componentes       celebrimbor
│   └── VALIDACION.md            veredictos y métricas por lote        boromir
├── data/                        derivados de ingesta, gitignored      frodo
│   ├── manifest.jsonl           una línea por imagen                  frodo
│   └── duplicados.json          grupos de hash repetidos              frodo
├── sandbox/                     experimentos descartables             pippin
├── storage/                     artefactos de la API, gitignored      frodo
├── frontend/
│   ├── tokens.css               paleta, tipografía, espaciado        celebrimbor
│   ├── styles.css               componentes y estados                celebrimbor
│   ├── index.html               estructura de la pantalla            celebrimbor
│   └── app.js                   consumo del contrato, estados        aragorn
├── fellowship/                  este equipo de agentes
└── pyproject.toml               deps + ruff + pytest + mypy
```

## 3. Fronteras

| Frontera | Qué cruza | Archivo | Verificación |
|---|---|---|---|
| Externo → dominio | bytes de imagen → `np.ndarray` listo | `core/io.py` | test con basura → `InvalidImage` |
| Dominio → HTTP | `LeafError` → status + código | `app/errors.py` | test de contrato sobre la forma del error |
| Dominio → disco | `InspectionResult` → original + resultado + JSON | `app/repository.py` | unitario con `tmp_path` |
| Dominio → cliente | objetos internos → `schemas.py` | `app/routers/` | `response_model` + test de contrato |
| Dominio → pantalla | máscaras → PNG legible | `core/render.py` | unitario de forma, color y contraste |
| Diseño → contrato | prohibido: la pantalla se adapta al schema | `frontend/` | revisión de Celebrimbor contra `schemas.py` |
| Core → framework | prohibido | todo `core/` | `test_architecture.py` en subproceso |

Ningún paso intermedio conoce al siguiente. El core no sabe qué es un 422; el
repository no sabe qué es una máscara; el router no sabe qué es Otsu.

## 4. El dataset real (verificado)

`imgs/` tiene **2000 PNG de 800×800 px, RGB**, sin fondo ni hoja completa:

| Grupo | Cantidad | Lectura |
|---|---|---|
| `IMG_<fecha>_<hora>_<n>.png` | 210 | originales de cámara; la unidad de muestreo es la **hoja** |
| `augmented_<i>_<k>.png` | 1680 | 8 variantes por base i (210 bases) |
| `A_IMG_..._<uuid>.png` | 110 | variantes con nombre duplicado de una corrida anterior |
| Duplicados exactos (sha256) | 42 grupos / 90 archivos | incluyen `augmented_116_2` idéntica a una `IMG_` |

Consecuencias obligatorias:

1. **El dataset no necesita aislamiento; las fotos nuevas sí**: las 2000
   imágenes son recortes de superficie foliar y `LeafIsolator` las conserva como
   `primer_plano`. Una foto con fondo se recorta a la hoja dominante antes de
   analizar (ADR-009). El objeto de segmentación sigue siendo **lesiones,
   manchas, orificios y nervaduras**, no el contorno de la hoja.
2. **No hay morfometría de hoja completa**: no se puede medir área ni perímetro
   de la hoja. Se mide el **defecto** (área relativa, cantidad, forma) y, sin
   patrón de escala, las unidades son píxeles y fracciones, nunca milímetros.
3. **2000 archivos no son 2000 muestras**: las variantes comparten hoja de
   origen. Toda métrica y toda evaluación se agrupa por hoja base. Contar
   variantes como muestras independientes es fuga de datos y Boromir lo rechaza.
4. **Duplicados ya existen en el dataset**: Frodo los detecta por hash antes de
   que cualquier lote entre al pipeline.
5. La señal dominante es **color y textura**; la geometría es secundaria.
6. **La compuerta de dominio valida la superficie, no la especie**: rechaza
   imágenes que no parecen hoja (documentos, paredes, cielo) con una envolvente
   de seis rasgos. Una hoja enferma es una hoja válida y no se rechaza. El
   aislamiento elige la región verde dominante, no autentica especie: dos hojas
   verdes en cuadro producen la advertencia `varias_regiones_verdes`.

## 5. Estados del pipeline

```
POST /api/inspections (imagen)
  → app/uploads.py       tamaño, decodificable, formato por contenido   → 413 / 400
  → core/io.py           bytes → ndarray, sin pérdida
  → LeafInspector        isolate → preprocess → quality → domain → segment → measure → describe
  → core/render.py       máscaras → overlay legible sobre el recorte analizado
  → app/repository.py    original → resultado → JSON (commit point)
  → app/schemas.py       InspectionOut = contrato con front y tests

GET /api/reports/lot
  → app/reporting.py     agrega solo inspecciones aceptadas, al leer
  → app/schemas.py       LotReportOut = cifras, series y puntos del lote

DELETE /api/inspections/{id}
  → app/repository.py    borra original, resultado y JSON        → 204 / 404

DELETE /api/inspections
  → app/repository.py    barre todos los registros y sus .tmp   → 204 (idempotente)
```

Errores de dominio: `InvalidImage` (400), `UnusableImage` (422),
`NotALeaf` (422, `IMAGE_NOT_A_LEAF`), `InspectionNotFound` (404), `LeafError`
(400, fallback). Un solo formato de error en el alambre:
`{"detail": {"code": "...", "message": "..."}}`.

## 6. Reglas transversales

1. **Solo visión clásica**: OpenCV, NumPy, SciPy, pandas. Nada de modelos
   preentrenados ni segmentación aprendida. Excepción: ADR de Gandalf.
2. **`imgs/` es sagrado**: ningún agente escribe, renombra ni convierte ahí.
3. **El core no importa FastAPI ni `app`**: lo verifica un test en subproceso.
4. **Determinismo**: misma entrada + mismos parámetros = misma salida. Semillas
   explícitas en todo proceso aleatorio.
5. **Sin números sin procedencia**: cada métrica cita imagen, máscara, parámetros
   y versión del código.
6. **Un cambio de contrato es un ADR** en `docs/DECISIONES.md`.
7. **Escala antes que precisión**: sin patrón de referencia no hay milímetros.
8. **Veto de calidad**: Boromir bloquea el lote; solo Gandalf lo revisa por
   escrito.
9. **El diseño no cambia el contrato**: si la pantalla necesita otro dato, se
   pide un ADR y se agrega al schema; jamás se inventa en el frontend.
10. **Un solo sistema visual**: colores, fuentes y espaciados salen de
    `frontend/tokens.css`; no hay valores literales sueltos en pantalla.
11. **El informe no inventa**: se agrega al leer sobre lo aceptado; no hay
    informe persistido ni caché. Los registros sin `trace.isolation` se declaran
    `desconocido` en lugar de suponer un método.
12. **Vaciar es una sola operación**: `DELETE /api/inspections` borra el lote y
    sus artefactos en el servidor, sin iterar borrados desde el cliente ni tocar
    archivos ajenos al almanaque (ADR-011).
