/**
 * El pulso de la página.
 *
 * Todo lo que necesita JavaScript para existir vive acá, y cada pieza está
 * envuelta para que un fallo no se lleve puesto al resto. El contenido, las
 * tarjetas y la carta ya vienen escritos desde la forja: sin este archivo, la
 * página se lee igual.
 */

import { reglaViva } from './regla.js';

const MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)';

function intentar(nombre, tarea) {
  try {
    tarea();
  } catch (error) {
    console.warn(`[pulso] ${nombre}:`, error);
  }
}

/* ------------------------------------------------------------
   Cabecera, progreso y brújula de secciones
   ------------------------------------------------------------ */
function iniciarCabecera() {
  const cabecera = document.querySelector('[data-cabecera]');
  const barra = document.querySelector('[data-progreso]');
  const reglaBarra = barra ? reglaViva('[data-progreso]', 'transform', 'scaleX(0)') : null;
  const enlaces = [...document.querySelectorAll('.nav__lista a, .nav-movil__panel a')];
  const destinos = enlaces
    .map((enlace) => ({
      enlace,
      seccion: document.querySelector(enlace.getAttribute('href') || '')
    }))
    .filter((par) => par.seccion);

  let pendiente = 0;

  const leer = () => {
    pendiente = 0;
    const recorrido = window.scrollY || document.documentElement.scrollTop;

    if (cabecera) {
      cabecera.dataset.scrolled = recorrido > 12 ? 'true' : 'false';
    }

    if (reglaBarra) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const avance = total > 0 ? Math.min(1, Math.max(0, recorrido / total)) : 0;
      reglaBarra.transform = `scaleX(${avance.toFixed(4)})`;
    }

    const linea = window.innerHeight * 0.4;
    let activa = '';

    for (const { seccion } of destinos) {
      const caja = seccion.getBoundingClientRect();
      if (caja.top <= linea && caja.bottom > linea) {
        activa = seccion.id;
        break;
      }
    }

    for (const enlace of enlaces) {
      const apunta = enlace.getAttribute('href') === `#${activa}`;
      if (activa && apunta) {
        enlace.setAttribute('aria-current', 'location');
      } else {
        enlace.removeAttribute('aria-current');
      }
    }
  };

  const pedir = () => {
    if (!pendiente) pendiente = requestAnimationFrame(leer);
  };

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir, { passive: true });
  leer();
}

/* ------------------------------------------------------------
   Menú de móvil: se cierra solo cuando ya cumplió su función
   ------------------------------------------------------------ */
function iniciarMenu() {
  const menu = document.querySelector('[data-nav-movil]');
  if (!menu) return;

  const resumen = menu.querySelector('summary');

  const cerrar = (devolverFoco) => {
    if (!menu.open) return;
    menu.open = false;
    if (devolverFoco && resumen) resumen.focus({ preventScroll: true });
  };

  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) cerrar(true);
  });

  document.addEventListener('click', (evento) => {
    if (menu.open && !menu.contains(evento.target)) cerrar(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrar(true);
  });
}

/* ------------------------------------------------------------
   Copiar la dirección, con la dirección siempre a la vista
   ------------------------------------------------------------ */
function iniciarCopia() {
  const boton = document.querySelector('[data-copiar]');
  const estado = document.querySelector('[data-copiado]');
  const correo = document.querySelector('.carta__mail');
  if (!boton || !estado || !correo || !navigator.clipboard?.writeText) return;

  const direccion = correo.textContent.trim();
  if (!direccion) return;

  const etiqueta = 'Copiar dirección';
  let reloj = 0;

  boton.hidden = false;
  boton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(direccion);
      estado.textContent = 'Copiado. Gracias.';
      boton.textContent = 'Dirección copiada';
    } catch {
      estado.textContent = 'No se pudo copiar: la dirección está a la vista.';
    }

    window.clearTimeout(reloj);
    reloj = window.setTimeout(() => {
      estado.textContent = '';
      boton.textContent = etiqueta;
    }, 2600);
  });
}

/* ------------------------------------------------------------
   Aparición: solo lo que todavía no se vio
   ------------------------------------------------------------ */
function iniciarRevelado() {
  const elementos = [...document.querySelectorAll('[data-reveal]')];
  if (elementos.length === 0 || !('IntersectionObserver' in window)) return;
  if (window.matchMedia(MOVIMIENTO_REDUCIDO).matches) return;

  const umbral = window.innerHeight * 0.92;
  const debajo = elementos.filter((elemento) => elemento.getBoundingClientRect().top > umbral);
  if (debajo.length === 0) return;

  for (const elemento of debajo) elemento.classList.add('revelar');

  function mostrar(elemento) {
    observador.unobserve(elemento);
    elemento.classList.add('es-visible');

    window.setTimeout(() => {
      elemento.classList.remove('revelar', 'es-visible');
    }, 700);
  }

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (entrada.isIntersecting || entrada.boundingClientRect.bottom < 0) {
        mostrar(entrada.target);
      }
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

  for (const elemento of debajo) observador.observe(elemento);
}

/* ------------------------------------------------------------
   La brisa, al final y aparte: si falla, la página sigue
   ------------------------------------------------------------ */
function iniciarComarca() {
  if (window.matchMedia(MOVIMIENTO_REDUCIDO).matches) return;

  const brisa = document.getElementById('brisa');
  const comarca = document.querySelector('[data-comarca]');
  if (!brisa || !comarca) return;

  import('./comarca.js')
    .then(({ initComarca }) => {
      initComarca({
        brisa,
        comarca,
        portada: document.getElementById('portada'),
        boton: document.querySelector('[data-chispa]')
      });
    })
    .catch((error) => console.warn('[pulso] brisa:', error));
}

function arrancar() {
  intentar('cabecera', iniciarCabecera);
  intentar('menú', iniciarMenu);
  intentar('revelado', iniciarRevelado);
  intentar('copia', iniciarCopia);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => intentar('brisa', iniciarComarca));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', arrancar, { once: true });
} else {
  arrancar();
}
