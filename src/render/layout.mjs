// Estructura común de todas las páginas.
import CONFIG from '../../config.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Variación de texto para que los símbolos del zodíaco no se dibujen como emoji en celulares.
export const g = (s) => `${s}︎`;

const FUENTES = 'https://fonts.googleapis.com/css2?family=Marcellus&family=Mulish:wght@400;600;700&display=swap';

const NAV = [
  ['index.html', 'Horóscopo de hoy', 'inicio'],
  ['luna-hoy.html', 'Luna hoy', 'luna'],
  ['compatibilidad.html', 'Compatibilidad', 'compat'],
  ['carta-natal.html', 'Carta natal', 'natal'],
  ['tarot-lenormand.html', 'Tarot', 'tarot'],
  ['calendario-astral.html', 'Calendario astral', 'calendario'],
];

// Google Analytics: páginas vistas automáticas y un evento por cada clic en un link del sitio,
// con la zona donde estaba (menú, pie, tarjeta de signo, etc.) para saber qué se usa más.
const analytics = (id) => `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${id}');
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.origin!==location.origin)return;
var s=a.closest('section'),t=s&&s.querySelector('h1,h2');
var z=a.closest('header')?'menu':a.closest('footer')?'pie':a.classList[0]||(t?t.textContent.trim().slice(0,40):'contenido');
gtag('event','clic_interno',{destino:a.pathname,zona:z});});
</script>`;

function adSlot(nombre, clase = '') {
  if (CONFIG.adsenseClient) {
    return `<div class="ad-live ${clase}"><ins class="adsbygoogle" style="display:block" data-ad-client="${CONFIG.adsenseClient}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
  }
  return `<div class="ad ${clase}" aria-hidden="true">Espacio publicitario · ${esc(nombre)}</div>`;
}
export { adSlot };

/**
 * opts: { titulo, descripcion, ruta, base, seccion, contenido, css, fragmento, jsonld }
 * - base: prefijo relativo hasta la raíz ('' o '../')
 * - fragmento: true para la página principal del artifact (sin doctype/html/head/body)
 */
export function pagina(opts) {
  const { titulo, descripcion, ruta, base = '', seccion, contenido, css, fragmento, jsonld, actualizado } = opts;
  const canonical = `${CONFIG.url}/${ruta.replace(/index\.html$/, '').replace(/\.html$/, '')}`;
  const estilos = css ? `<style>${css}</style>` : `<link rel="stylesheet" href="${base}styles.css">`;
  const adsense = CONFIG.adsenseClient
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.adsenseClient}" crossorigin="anonymous"></script>` : '';
  // En la demo publicada, la pestaña muestra el nombre del sitio.
  const meta = `<title>${esc(fragmento ? CONFIG.nombre : titulo)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(CONFIG.nombre)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="es_AR">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FUENTES}">
${estilos}
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
${adsense}
${CONFIG.analytics && !fragmento ? analytics(CONFIG.analytics) : ''}`;

  const cuerpo = `<header class="top"><div class="wrap">
  <a class="brand" href="${base}index.html"><b>${esc(CONFIG.nombre)}</b><span class="glyph" aria-hidden="true">${g('✦')}</span></a>
  <nav class="nav" aria-label="Secciones">${NAV.map(([href, txt, id]) => `<a href="${base}${href}"${id === seccion ? ' aria-current="page"' : ''}>${txt}</a>`).join('')}</nav>
</div></header>
<main>${contenido}</main>
<footer class="foot"><div class="wrap">
  <nav aria-label="Pie">${NAV.map(([href, txt]) => `<a href="${base}${href}">${txt}</a>`).join('')}<a href="${base}privacidad.html">Privacidad</a></nav>
  <p style="margin:0">${esc(CONFIG.nombre)} calcula cada día la posición real del Sol, la Luna y los planetas, y a partir de ese cielo escribe el horóscopo de cada signo. Contenido de entretenimiento.</p>
  <p style="margin:0" class="mono">Actualizado: ${esc(actualizado)} (hora de ${esc(CONFIG.pais)})</p>
</div></footer>`;

  if (fragmento) return `${meta}\n${cuerpo}\n`;
  return `<!doctype html>
<html lang="${CONFIG.idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${meta}
</head>
<body>
${cuerpo}
</body>
</html>
`;
}
