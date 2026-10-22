/**
 * Una regla viva, sin tocar `style`.
 *
 * La CSP del sitio no permite estilos en línea (`style-src` sin
 * `'unsafe-inline'`), y `elemento.style.setProperty` termina justamente ahí.
 * Para mover el paralaje y la barra de progreso sin abrir la CSP se inserta una
 * regla en la hoja propia y se actualiza su declaración: el navegador la trata
 * como CSS de autor. Si no hay hoja accesible, devuelve null y el efecto se
 * omite: es adorno, no contenido.
 */
export function reglaViva(selector, propiedad, valorInicial) {
  const hoja = [...document.styleSheets].find((candidata) => {
    try {
      return Boolean(candidata.href && candidata.href.includes('/styles/') && candidata.cssRules);
    } catch {
      return false;
    }
  });

  if (!hoja) return null;

  try {
    const indice = hoja.insertRule(
      `${selector} { ${propiedad}: ${valorInicial}; }`,
      hoja.cssRules.length
    );
    return hoja.cssRules[indice].style;
  } catch {
    return null;
  }
}
