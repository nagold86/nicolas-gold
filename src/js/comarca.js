/**
 * La brisa de la Comarca.
 *
 * Polen, hojas y un poco de paralaje. Nada de esto sostiene el contenido:
 * si el canvas no existe o falla, la página se lee igual. El motor se apaga
 * solo cuando la portada sale de pantalla, cuando la pestaña se oculta y
 * cuando el visitante pidió menos movimiento.
 */

const MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)';
const LIMITE_DPR = 2;
const LIMITE_PIXELES = 2400000;

const azar = (minimo, maximo) => minimo + Math.random() * (maximo - minimo);
const entre = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));

function leerToken(nombre) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

export function initComarca({ brisa, comarca, portada, boton }) {
  if (!brisa || !comarca || !portada) return;

  const reducir = window.matchMedia(MOVIMIENTO_REDUCIDO);
  if (reducir.matches) return;

  const contexto = brisa.getContext('2d', { alpha: true });
  if (!contexto) return;

  const colores = {
    hoja: leerToken('--hoja'),
    hojaClara: leerToken('--hoja-clara'),
    miel: leerToken('--miel'),
    crema: leerToken('--crema'),
    brillo: leerToken('--rio-brillo')
  };

  let ancho = 0;
  let alto = 0;
  let dpr = 1;
  let cuadro = 0;
  let ultimo = 0;
  let enPantalla = true;
  let vivo = true;

  const motas = [];
  const hojas = [];
  const rafagas = [];

  /* ----------------------------------------------------------
     Paralaje: una sola variable, leída por el CSS
     ---------------------------------------------------------- */
  let medida = 0;

  function parallax() {
    medida = 0;
    const caja = portada.getBoundingClientRect();
    if (caja.bottom < 0 || caja.top > window.innerHeight) return;

    const recorrido = Math.max(1, portada.offsetHeight);
    const avance = entre(-caja.top / recorrido, 0, 1);
    comarca.style.setProperty('--avance', avance.toFixed(3));
  }

  function pedirParallax() {
    if (!medida) medida = requestAnimationFrame(parallax);
  }

  /* ----------------------------------------------------------
     Tamaño del canvas, con techo de píxeles
     ---------------------------------------------------------- */
  function ajustar() {
    const caja = brisa.getBoundingClientRect();
    ancho = Math.max(1, Math.round(caja.width));
    alto = Math.max(1, Math.round(caja.height));

    const area = ancho * alto;
    const techo = Math.sqrt(LIMITE_PIXELES / area);
    dpr = entre(Math.min(window.devicePixelRatio || 1, LIMITE_DPR, techo), 0.75, LIMITE_DPR);

    brisa.width = Math.round(ancho * dpr);
    brisa.height = Math.round(alto * dpr);
    contexto.setTransform(dpr, 0, 0, dpr, 0, 0);

    sembrar();
  }

  /* ----------------------------------------------------------
     Semilla: polen que sube y hojas que bajan
     ---------------------------------------------------------- */
  function sembrar() {
    motas.length = 0;
    hojas.length = 0;

    const densidad = entre(ancho / 1440, 0.35, 1);
    const totalMotas = Math.round(10 + 22 * densidad);
    const totalHojas = Math.round(3 + 6 * densidad);

    for (let i = 0; i < totalMotas; i += 1) {
      motas.push({
        x: azar(-12, ancho + 12),
        y: azar(0, alto),
        vx: azar(-3, 5),
        vy: azar(-13, -4),
        radio: azar(0.6, 1.9),
        fase: azar(0, Math.PI * 2),
        giro: azar(0.5, 1.4),
        alfa: azar(0.22, 0.6),
        brillo: Math.random() < 0.22,
        color: Math.random() < 0.55 ? colores.crema : colores.miel
      });
    }

    for (let i = 0; i < totalHojas; i += 1) {
      hojas.push({
        x: azar(-20, ancho + 20),
        y: azar(-alto * 0.2, alto),
        vx: azar(4, 16),
        vy: azar(9, 22),
        tamano: azar(2.4, 5),
        giro: azar(0, Math.PI * 2),
        vuelta: azar(-1.4, 1.4),
        fase: azar(0, Math.PI * 2),
        alfa: azar(0.3, 0.62),
        color: Math.random() < 0.6 ? colores.hojaClara : colores.hoja
      });
    }
  }

  /* ----------------------------------------------------------
     Dibujo
     ---------------------------------------------------------- */
  function dibujarMota(mota, tiempo) {
    const pulso = 0.62 + 0.38 * Math.sin(tiempo / 850 + mota.fase);
    const alfa = mota.alfa * pulso;
    const { x, y, radio } = mota;

    contexto.globalAlpha = alfa;
    contexto.fillStyle = mota.color;

    if (mota.brillo && radio > 1.2) {
      const largo = radio * 2.6;
      contexto.fillRect(x - largo / 2, y - 0.35, largo, 0.7);
      contexto.fillRect(x - 0.35, y - largo / 2, 0.7, largo);
    }

    contexto.beginPath();
    contexto.arc(x, y, radio, 0, Math.PI * 2);
    contexto.fill();
  }

  function dibujarHoja(x, y, tamano, giro, alfa, color) {
    contexto.save();
    contexto.translate(x, y);
    contexto.rotate(giro);
    contexto.globalAlpha = alfa;
    contexto.fillStyle = color;
    contexto.beginPath();
    contexto.ellipse(0, 0, tamano * 1.55, tamano * 0.72, 0, 0, Math.PI * 2);
    contexto.fill();

    contexto.globalAlpha = alfa * 0.55;
    contexto.strokeStyle = colores.crema;
    contexto.lineWidth = 0.5;
    contexto.beginPath();
    contexto.moveTo(-tamano * 1.2, 0);
    contexto.lineTo(tamano * 1.2, 0);
    contexto.stroke();
    contexto.restore();
  }

  function actualizarAmbiente(dt, tiempo) {
    const viento = Math.sin(tiempo / 4800) * 7 + 5;
    const altoPantalla = alto;

    for (const mota of motas) {
      mota.fase += dt * mota.giro;
      mota.x += (mota.vx + viento * 0.35 + Math.sin(mota.fase) * 3) * dt;
      mota.y += mota.vy * dt;

      if (mota.y < -14) {
        mota.y = altoPantalla + azar(4, 30);
        mota.x = azar(-12, ancho + 12);
      }
      if (mota.x > ancho + 16) mota.x = -16;
      if (mota.x < -16) mota.x = ancho + 16;

      dibujarMota(mota, tiempo);
    }

    for (const hoja of hojas) {
      hoja.fase += dt * 1.3;
      hoja.x += (hoja.vx + viento * 0.55 + Math.sin(hoja.fase) * 11) * dt;
      hoja.y += hoja.vy * dt;
      hoja.giro += hoja.vuelta * dt;

      if (hoja.y > altoPantalla + 24) {
        hoja.y = -24;
        hoja.x = azar(-20, ancho);
      }
      if (hoja.x > ancho + 28) hoja.x = -28;

      const vaiven = 0.8 + 0.2 * Math.sin(hoja.fase);
      dibujarHoja(hoja.x, hoja.y, hoja.tamano, hoja.giro, hoja.alfa * vaiven, hoja.color);
    }
  }

  function actualizarRafagas(dt) {
    for (let i = rafagas.length - 1; i >= 0; i -= 1) {
      const parte = rafagas[i];
      parte.vy += 34 * dt;
      parte.vx *= 1 - 0.55 * dt;
      parte.x += parte.vx * dt;
      parte.y += parte.vy * dt;
      parte.giro += parte.vuelta * dt;
      parte.vida -= dt;

      if (parte.vida <= 0 || parte.y > alto + 40 || parte.x < -40 || parte.x > ancho + 40) {
        rafagas.splice(i, 1);
        continue;
      }

      const alfa = entre(parte.vida / parte.total, 0, 1);
      if (parte.tipo === 'hoja') {
        dibujarHoja(parte.x, parte.y, parte.tamano, parte.giro, alfa * 0.85, parte.color);
      } else {
        contexto.globalAlpha = alfa * 0.75;
        contexto.fillStyle = parte.color;
        contexto.beginPath();
        contexto.arc(parte.x, parte.y, parte.tamano, 0, Math.PI * 2);
        contexto.fill();
      }
    }
  }

  function bucle(tiempo) {
    cuadro = 0;
    if (!vivo || !enPantalla || document.hidden) return;

    if (!ultimo) ultimo = tiempo;
    const dt = Math.min(0.05, Math.max(0, (tiempo - ultimo) / 1000));
    ultimo = tiempo;

    contexto.clearRect(0, 0, ancho, alto);
    actualizarAmbiente(dt, tiempo);
    actualizarRafagas(dt);
    contexto.globalAlpha = 1;

    cuadro = requestAnimationFrame(bucle);
  }

  function despertar() {
    if (!vivo || !enPantalla || document.hidden || cuadro) return;
    ultimo = 0;
    cuadro = requestAnimationFrame(bucle);
  }

  function dormir() {
    if (!cuadro) return;
    cancelAnimationFrame(cuadro);
    cuadro = 0;
  }

  /* ----------------------------------------------------------
     La mano del visitante
     ---------------------------------------------------------- */
  function soplar(x, y, cantidad) {
    if (!vivo || reducir.matches) return;

    for (let i = 0; i < cantidad; i += 1) {
      const angulo = azar(-Math.PI * 0.96, -Math.PI * 0.04);
      const impulso = azar(55, 215);
      const esHoja = Math.random() < 0.72;
      const total = azar(0.85, 1.7);

      rafagas.push({
        tipo: esHoja ? 'hoja' : 'mota',
        x,
        y,
        vx: Math.cos(angulo) * impulso + azar(-18, 18),
        vy: Math.sin(angulo) * impulso * azar(0.7, 1.1),
        tamano: esHoja ? azar(2.4, 5.2) : azar(0.9, 2.1),
        giro: azar(0, Math.PI * 2),
        vuelta: azar(-4.5, 4.5),
        vida: total,
        total,
        color: esHoja
          ? (Math.random() < 0.55 ? colores.hojaClara : colores.hoja)
          : (Math.random() < 0.5 ? colores.miel : colores.crema)
      });
    }

    despertar();
  }

  function alTocar(evento) {
    if (evento.target.closest('[data-chispa]')) return;
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;

    const caja = brisa.getBoundingClientRect();
    const x = evento.clientX - caja.left;
    const y = evento.clientY - caja.top;
    if (x < 0 || y < 0 || x > caja.width || y > caja.height) return;

    soplar(x, y, evento.pointerType === 'touch' ? 11 : 15);
  }

  /* ----------------------------------------------------------
     Encendido y apagado
     ---------------------------------------------------------- */
  function alCambiarMovimiento() {
    if (reducir.matches) {
      vivo = false;
      dormir();
      contexto.clearRect(0, 0, ancho, alto);
      if (boton) boton.hidden = true;
      return;
    }

    vivo = true;
    if (boton) boton.hidden = false;
    ajustar();
    despertar();
  }

  ajustar();
  parallax();
  if (boton) boton.hidden = false;
  despertar();

  portada.addEventListener('pointerdown', alTocar, { passive: true });
  window.addEventListener('scroll', pedirParallax, { passive: true });
  window.addEventListener('resize', () => {
    pedirParallax();
    ajustar();
    despertar();
  }, { passive: true });

  if (boton) {
    boton.addEventListener('click', () => soplar(ancho * 0.5, alto * 0.58, 22));
  }

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver((entradas) => {
      enPantalla = entradas.some((entrada) => entrada.isIntersecting);
      if (enPantalla) despertar();
      else dormir();
    }, { threshold: 0 });
    observador.observe(portada);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) dormir();
    else despertar();
  });

  if (typeof reducir.addEventListener === 'function') {
    reducir.addEventListener('change', alCambiarMovimiento);
  }
}
