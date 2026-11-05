// Tarot Lenormand: tirada de 3 cartas, carta del día y una página por carta.
import CONFIG from '../../config.mjs';
import { CARTAS, POSICIONES, TEMAS } from '../data/lenormand.mjs';
import { pagina, adSlot, esc, g } from './layout.mjs';

const rojo = (naipe) => /[♥♦]/.test(naipe);
const TONO = { 1: 'Favorable', 0: 'Neutra', '-1': 'Desafiante' };

// Cara de una carta. Se usa al generar el sitio y en el navegador al tirar las cartas.
export function caraCarta(c, { href } = {}) {
  const tag = href ? 'a' : 'div';
  return `<${tag} class="lcard"${href ? ` href="${href}"` : ''}>
  <span class="n mono">${c.n}</span><span class="p glyph${rojo(c.naipe) ? ' red' : ''}">${c.naipe.slice(0, -1)}${g(c.naipe.slice(-1))}</span>
  <span class="star glyph" aria-hidden="true">${g('✦')}</span>
  <b>${esc(c.nombre.replace(/^(El|La|Los|Las) /, ''))}</b>
  <span class="k">${esc(c.claves[0])}</span>
</${tag}>`;
}

// Lectura armada con las tres cartas: se usa en el navegador.
export function lectura(cartas, tema) {
  const [a, b, c] = cartas;
  const suma = a.tono + b.tono + c.tono;
  const tendencia = suma >= 2 ? 'Favorable' : suma <= -2 ? 'Con desafíos' : 'Mixta';
  const detalle = suma >= 2 ? 'Las cartas acompañan: es buen momento para avanzar.'
    : suma <= -2 ? 'Hay obstáculos, pero las cartas muestran por dónde pasar: tómalo como una advertencia, no como un destino.'
      : 'Hay luces y sombras: lo que hagas inclina la balanza.';
  return {
    frase: `Tu tirada empieza con ${a.claves[0]} (${a.nombre}), se desarrolla con ${b.claves[0]} (${b.nombre}) y apunta a ${c.claves[0]} (${c.nombre}).`,
    tendencia, detalle, consejo: c.consejo, tema: TEMAS[tema],
  };
}

const PASOS = `<ol class="steps">
  <li>Piensa en una pregunta o en el tema que te preocupa.</li>
  <li>Elige si la consulta es general, de amor o de trabajo.</li>
  <li>Toca <b>Tirar las cartas</b>: el mazo se mezcla y salen tres cartas al azar.</li>
</ol>`;

const clave = (s) => s.split('').reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261) >>> 0;
export const cartaDelDia = (fechaISO) => CARTAS[clave(`lenormand:${fechaISO}`) % CARTAS.length];

export function paginaTarot(ctx) {
  const hoy = cartaDelDia(ctx.fechaISO);
  const contenido = `
<section class="sky"><div class="wrap tarot-hero">
  <div>
    <div class="eyebrow">Tarot Lenormand</div>
    <h1>Tirada de 3 cartas</h1>
    <p>El Lenormand es un mazo de 36 cartas con imágenes simples (un barco, una llave, un corazón) que se leen de corrido, como una frase. Es directo y fácil de interpretar.</p>
    ${PASOS}
  </div>
</div></section>

<div class="wrap">
  <section class="section">
    <form class="tirada" id="tirada">
      <fieldset class="temas"><legend>Tu consulta es sobre</legend>
        ${Object.entries(TEMAS).map(([id, txt], i) => `<label><input type="radio" name="tema" value="${id}"${i === 0 ? ' checked' : ''}> ${txt}</label>`).join('')}
      </fieldset>
      <button class="btn" type="submit">Tirar las cartas</button>
    </form>
    <div class="spread" id="spread" aria-live="polite">
      ${POSICIONES.map((p) => `<div class="slot"><div class="pos">${p}</div><div class="lflip"><div class="back" aria-hidden="true"><span class="glyph">${g('✦')}</span></div></div><div class="sig"></div></div>`).join('')}
    </div>
    <div class="reading" id="reading" hidden></div>
  </section>

  ${adSlot('tarot', 'ad-wide')}

  <section class="section">
    <h2>La carta del día</h2>
    <p class="lead">Una carta para todos, que cambia cada día. Hoy, ${esc(ctx.fechaLarga.toLowerCase())}:</p>
    <div class="daycard">
      ${caraCarta(hoy, { href: `lenormand/${hoy.id}.html` })}
      <div><h3>${esc(hoy.nombre)}</h3><p>${esc(hoy.general)}</p><p class="advice" style="margin:0">${esc(hoy.consejo)}</p>
      <p><a href="lenormand/${hoy.id}.html">Leer el significado completo</a></p></div>
    </div>
  </section>

  <section class="section">
    <h2>Significado de las 36 cartas</h2>
    <p class="lead">Toca una carta para ver qué significa en general, en el amor y en el trabajo.</p>
    <div class="deck">${CARTAS.map((c) => caraCarta(c, { href: `lenormand/${c.id}.html` })).join('')}</div>
  </section>
  <p class="note">Las tiradas son un entretenimiento: tómalas como una invitación a reflexionar, no como una predicción.</p>
</div>
<script type="module" src="js/src/cliente/lenormand.mjs"></script>`;

  return pagina({
    titulo: `Tarot Lenormand gratis: tirada de 3 cartas online | ${CONFIG.nombre}`,
    descripcion: 'Tirada de tarot Lenormand gratis de 3 cartas al azar, con interpretación simple para el amor, el trabajo y en general. Carta del día y significado de las 36 cartas.',
    ruta: 'tarot-lenormand.html', seccion: 'tarot', contenido, actualizado: ctx.actualizado,
  });
}

export function paginaCarta(ctx, c) {
  const i = CARTAS.indexOf(c);
  const prev = CARTAS[(i + 35) % 36], next = CARTAS[(i + 1) % 36];
  const contenido = `
<div class="wrap narrow">
  <section class="sign-hero">
    <div class="crumbs"><a href="../tarot-lenormand.html">Tarot Lenormand</a> › Carta ${c.n}</div>
    <div class="card-head">
      ${caraCarta(c)}
      <div><h1>${esc(c.nombre)}</h1><p class="date">Carta ${c.n} del Lenormand · naipe <span class="glyph">${c.naipe.slice(0, -1)}${g(c.naipe.slice(-1))}</span> · ${TONO[c.tono]}</p>
      <div class="chips" style="margin-top:12px">${c.claves.map((k) => `<span class="chip">${esc(k)}</span>`).join('')}</div></div>
    </div>
    <div class="prose" style="margin-top:22px"><p>${esc(c.general)}</p></div>
  </section>
  <div class="areas">
    <div class="area"><h2>En el amor</h2><p>${esc(c.amor)}</p></div>
    <div class="area"><h2>En el trabajo y el dinero</h2><p>${esc(c.trabajo)}</p></div>
  </div>
  ${adSlot('carta lenormand')}
  <p class="advice">${esc(c.consejo)}</p>
  <section class="section" style="padding-top:8px">
    <a class="btn" href="../tarot-lenormand.html">Hacer una tirada de 3 cartas</a>
  </section>
  <nav class="prevnext" aria-label="Otras cartas">
    <a href="${prev.id}.html">‹ ${prev.n}. ${esc(prev.nombre)}</a>
    <a href="${next.id}.html">${next.n}. ${esc(next.nombre)} ›</a>
  </nav>
</div>`;
  return pagina({
    titulo: `${c.nombre} en el Lenormand (carta ${c.n}): significado en el amor y el trabajo | ${CONFIG.nombre}`,
    descripcion: `Significado de ${c.nombre}, la carta ${c.n} del tarot Lenormand: ${c.claves.join(', ')}. Qué indica en el amor, en el trabajo y qué consejo da.`,
    ruta: `lenormand/${c.id}.html`, base: '../', seccion: 'tarot', contenido, actualizado: ctx.actualizado,
  });
}
