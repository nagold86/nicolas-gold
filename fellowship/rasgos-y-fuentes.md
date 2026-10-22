# Rasgos de origen y fuentes

Cada agente se construyó a partir de rasgos documentados del personaje, no de una
impresión general. Este documento deja el rastro: qué rasgo se tomó, en qué se
apoya y cómo se tradujo a comportamiento técnico.

Los rasgos se parafrasean; no se reproducen fragmentos textuales de las obras.

## Composición de la Comunidad

La Comunidad del Anillo son **nueve caminantes**: cuatro hobbits, dos hombres, un
elfo, un enano y un mago. La cifra se elige en el Concilio de Elrond como
contrapeso a los nueve Nazgûl, y el reparto de razas es explícito en la obra. Ese
reparto es también la lógica del equipo: cada agente aporta una mirada distinta
sobre el mismo objeto de estudio, la hoja.

## Rasgos por personaje

### Gandalf

- **Rasgos:** el más sabio y experimentado del grupo; guía sin cargar con la
  misión; reconoce el peligro que otros no ven; se opone a los atajos peligrosos;
  deja de estar presente justo cuando el grupo debe aprender a seguir solo.
- **Traducción:** arquitecto del método. Escribe ADRs, veta atajos metodológicos y
  no ejecuta el pipeline. Su retorno en la segunda parte de la historia refuerza
  la idea de que el criterio se recupera, no se reemplaza.

### Aragorn

- **Rasgos:** heredero legítimo que no reclama el poder; guardabosques que conoce
  los caminos; líder por mérito y no por título; resiste la tentación del Anillo;
  sostiene al grupo cuando cae su guía; tiende puentes entre elfos y enanos.
- **Traducción:** orquestador. Conoce las rutas del dato, integra etapas que no se
  toleran entre sí y responde por la corrida completa sin reemplazar a los
  especialistas.

### Frodo

- **Rasgos:** acepta la carga que nadie más puede llevar; aguanta más de lo
  razonable; siente compasión por Gollum; la carga lo corroe lentamente y lo
  aísla; no habría llegado sin Sam.
- **Traducción:** custodio del dataset. Carga con el dato crudo, lo identifica y
  lo protege; la corrosión se traduce en el riesgo de aferrarse a imágenes
  defectuosas en lugar de rechazarlas con motivo.

### Sam

- **Rasgos:** jardinero, práctico y terco; lealtad absoluta; desconfía del atajo
  de Gollum; hace el trabajo invisible; Tolkien lo señaló como el verdadero héroe
  de la historia; no se rinde aunque el camino sea imposible.
- **Traducción:** preprocesado. El trabajo que nadie ve y del que depende todo:
  iluminación, fondo, ruido. Su terquedad se convierte en recetas simples que
  funcionan en todo el lote.

### Legolas

- **Rasgos:** vista excepcional y puntería sin fallo; rapidez; disciplina; al
  principio desprecia a los enanos; se vuelve inseparable de Gimli.
- **Traducción:** segmentación. Decide píxel por píxel qué es hoja. La rivalidad
  inicial se traduce en un ida y vuelta obligatorio con Gimli: una máscara que no
  permite medir no es una buena máscara.

### Gimli

- **Rasgos:** artesano orgulloso de su oficio; obstinado; valora el peso y el
  volumen; compite con Legolas y termina siendo su amigo; ferocidad y tosquedad
  como parte de su carácter.
- **Traducción:** morfometría. Pocas medidas, bien definidas, con unidad y error.
  Su obstinación es la regla de "sin calibración no hay milímetros".

### Merry

- **Rasgos:** se ofrece voluntario para pelear; madura más rápido que Pippin;
  subestimado por su tamaño; golpea al Rey Brujo en el momento exacto; sentido
  práctico.
- **Traducción:** color y textura. Toma los rasgos que nadie quiere definir y los
  convierte en descriptores con hipótesis. Su golpe oportuno es la detección de la
  lesión pequeña que cambia el grado de la hoja.

### Pippin

- **Rasgos:** curiosidad sin freno; imprudencia (mira el palantir, despierta a los
  goblins en Moria); suerte; aprende tarde; aporta en el momento crítico.
- **Traducción:** exploración. Rompe el pipeline a propósito en cuarentena y
  documenta el fallo. La regla de `sandbox/` existe por él.

### Boromir

- **Rasgos:** defiende la frontera de Gondor; valiente y fuerte; orgulloso; cede a
  la tentación del Anillo y ataca al portador; se redime muriendo en defensa del
  grupo.
- **Traducción:** validación. Es el portón entre el resultado y el reporte. Su
  tentación es la métrica alta y prolija; su redención es reconocer el error con
  evidencia y corregir el criterio.

## Fuentes consultadas

- Wikipedia, *Company of the Ring* — composición de la Comunidad, las nueve razas
  y el contexto del Concilio de Elrond.
  https://en.wikipedia.org/wiki/Company_of_the_Ring
- Collider, *All 9 Fellowship of the Ring Members, Ranked* (12/10/2024) — rasgos,
  fortalezas y debilidades de cada miembro, con foco en Boromir, Frodo, Pippin,
  Merry, Legolas, Gimli, Aragorn, Gandalf y Sam.
  https://collider.com/lord-of-the-rings-fellowship-of-the-ring-characters-ranked/
- Audible Blog, *Samwise Gamgee* — lealtad, humildad y la lectura de Tolkien sobre
  Sam como héroe.
  https://www.audible.com/blog/article-the-lord-of-the-rings-samwise-gamgee
- Audible Blog, *Boromir* — orgullo, coraje y corrupción por el Anillo.
  https://www.audible.com/blog/article-the-lord-of-the-rings-boromir
- Fenopaedia, *Samwise Gamgee* — oficio de jardinero y vínculo con Frodo.
  https://www.elfenomeno.com/en/info/ver/152/samwise-gamgee
- Literariness, *The Lord of the Rings Character Analysis* — lectura de Boromir
  como defensor y orgulloso representante de Gondor.
  https://literariness.org/2021/02/18/the-lord-of-the-rings-character-analysis/

## Criterio de descarte

No se usaron rasgos de adaptaciones que contradicen el texto (por ejemplo,
invenciones de las películas sobre la personalidad de Frodo o la relación entre
Legolas y Gimli cuando no aportan al trabajo técnico). El equipo se construye
sobre rasgos que además de ser canónicos **tienen consecuencia operativa**.
