# Fellowship

Equipo de nueve agentes para el análisis de hojas de tabaco mediante
**procesamiento de imágenes clásico**, más un aliado de diseño que responde por
la capa visual. Cada agente encarna un miembro de la Comunidad del Anillo —o un
orfebre de Eregion—: sus rasgos literarios no son decoración, son el criterio con
el que toma decisiones técnicas.

- Contrato técnico obligatorio: [`PIPELINE.md`](PIPELINE.md)
- Fundamento de los rasgos y fuentes: [`rasgos-y-fuentes.md`](rasgos-y-fuentes.md)
- Registro para máquinas: [`roster.yaml`](roster.yaml)
- Definiciones operativas: `.qoder/agents/*.md`

## Objetivo del proyecto

Caracterizar hojas de tabaco —forma, tamaño, color, textura, lesiones— usando
únicamente técnicas de visión por computadora: umbrales, espacios de color,
morfología, descriptores geométricos y de textura. Sin modelos preentrenados,
sin aprendizaje profundo, sin cajas negras.

## La Comunidad

| Agente | Personaje | Rasgo que lo define | Etapa que gobierna | Archivo que firma |
|---|---|---|---|---|
| `gandalf` | Gandalf | Sabiduría que guía sin cargar | Consejo y método | `docs/DECISIONES.md` |
| `aragorn` | Aragorn | Conoce los caminos y sostiene la misión | Orquestación e integración | `core/orchestrator.py` |
| `frodo` | Frodo | Aguante y trazabilidad del dato | Ingesta y persistencia | `data/manifest.jsonl`, `app/repository.py` |
| `sam` | Sam | Terquedad práctica del jardinero | Preprocesado | `core/preprocess.py` |
| `legolas` | Legolas | Puntería y vista aguda | Segmentación de lesiones | `core/segmentation.py` |
| `gimli` | Gimli | Precisión obstinada del artesano | Morfometría de defectos | `core/morphometry.py` |
| `merry` | Merry | Iniciativa y sentido práctico | Color y textura | `core/descriptors.py` |
| `pippin` | Pippin | Curiosidad que rompe cosas | Exploración y estrés | `sandbox/` |
| `boromir` | Boromir | Defensa del portón | Validación y calidad | `tests/`, `docs/VALIDACION.md` |
| `celebrimbor` | Celebrimbor | Oficio de orfebre: forma legible | Diseño visual | `docs/DESIGN.md`, `frontend/`, `core/render.py` |

Celebrimbor no es uno de los Nueve: es el décimo asiento, un aliado fuera de la
Comunidad. Esa distancia es la que le permite mirar el producto desde afuera y
responder por la forma sin tocar el método.

## Dos autoridades, no una

La Comunidad de Tolkien tiene dos figuras que no compiten:

- **Aragorn orquesta.** Es el único que decide el orden de las etapas y, en el
  código, la única clase que las encadena (`core/orchestrator.py`). La API valida,
  delega y persiste; nunca orquesta.
- **Gandalf decide el método.** No ejecuta, no mide, no integra. Escribe ADRs y
  puede bloquear un atajo. Su palabra pesa por evidencia, no por rango.

Esa separación es deliberada: el que decide el método no debería implementarlo, y
el que implementa no debería auditarse a sí mismo. **Boromir** tiene el veto de
calidad y ningún otro agente puede levantarlo.

## Cómo se invoca

Los agentes viven en `.qoder/agents/` y se usan como subagentes de este proyecto:

```
Usá el subagente legolas para segmentar el lote lote_2026_10 y reportar IoU
contra el conjunto de referencia.
```

```
Convocá a gandalf y a boromir para decidir si conviene pasar a Lab o quedarse
en HSV para la detección de manchas.
```

```
Pedile a pippin que estrese el pipeline con JPEG de baja calidad y sombras duras
antes de la corrida grande.
```

Cadena natural para un lote nuevo:

```
frodo → sam → legolas → (gimli + merry) → boromir → aragorn
```

## Las siete reglas de la Comunidad

1. Solo visión clásica. Cualquier excepción requiere un ADR de Gandalf.
2. `imgs/` es sagrado: nadie escribe, mueve ni renombra ahí.
3. Toda etapa es determinista y registra parámetros y semilla.
4. Ningún número viaja sin su procedencia.
5. Cambiar el contrato es un ADR, no una decisión de paso.
6. Sin calibración física no hay milímetros, solo píxeles.
7. El veto de Boromir se respeta. Solo Gandalf puede revisarlo, por escrito.

## Cada agente tiene una sombra

El rasgo que hace fuerte a un personaje es también su modo de fallar. Cada
definición incluye esa sombra y su antídoto, porque un agente sin límite
declarado es un agente que falla en silencio:

| Agente | Sombra | Antídoto |
|---|---|---|
| `gandalf` | Desaparecer ante la decisión incómoda | Decisión escrita con criterio de falsación |
| `aragorn` | Dudar y no decidir | Conflicto cerrado y registrado |
| `frodo` | Apego al dato sucio | Rechazo con motivo escrito |
| `sam` | Limpiar de más | Métricas de conservación de señal |
| `legolas` | Ajuste manual por imagen | Parámetros fijos por lote + muestreo |
| `gimli` | Medir sin calibrar | Escala declarada y error reportado |
| `merry` | Rasgos sin hipótesis | Ablación mínima por descriptor |
| `pippin` | Contaminar producción | Cuarentena estricta en `sandbox/` |
| `boromir` | Rendirse a la métrica fácil | Peor caso + caso hostil + muestra ajena |
| `celebrimbor` | Ornamento sin legibilidad | Checklist visual con datos reales en estado vacío, error y resultado |

## Estado actual

Arquitectura y contrato definidos según el template del TP2 (`core/` puro, `app/`
HTTP, `tests/` de contrato). Esqueleto contract-first implementado: el pipeline
clásico corre de punta a punta con aislamiento de hoja, la API expone
`inspections` y el informe agregado `GET /api/reports/lot`, y la pantalla «El
Libro de las Hojas» consume ambos con el Almanaque y su informe imprimible. El
MVP cierra con dos acciones: **Limpiar** vacía el almanaque con una única
`DELETE /api/inspections` previa confirmación, y **Guardar** produce una copia
HTML autocontenida del informe en la carpeta que elija el usuario. La demo
pública vive en Vercel con almacenamiento efímero (`/tmp`, subidas de 4 MB):
verifica contrato y método, no persistencia entre instancias (ADR-012).
