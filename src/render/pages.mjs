// Contenido de cada página del sitio.
import CONFIG from '../../config.mjs';
import { SIGNOS_ORDEN } from '../astro.mjs';
import { SIGNOS, PLANETA_NOMBRE, PLANETA_SIMBOLO, ELEMENTO, CASA_TEMA } from '../data/signos.mjs';
import { compatibilidad, resumen } from '../textgen.mjs';
import { pagina, adSlot, esc, g } from './layout.mjs';
import { ruedaZodiacal, dibujoLuna } from './svg.mjs';

const tz = CONFIG.zonaHoraria;
export const fmt = (d, o) => new Intl.DateTimeFormat('es-AR', { timeZone: tz, ...o }).format(d);
const hora = (d) => fmt(d, { hour: '2-digit', minute: '2-digit', hour12: false });
const diaCorto = (d) => fmt(d, { weekday: 'short', day: 'numeric', month: 'short' });
const grados = (x) => `${Math.floor(x)}°${String(Math.floor((x % 1) * 60)).padStart(2, '0')}′`;
const N = (id) => SIGNOS[id].nombre;
const diaMes = (d) => fmt(d, { day: 'numeric', month: 'long' });
// Rango de fechas del año real: desde el día en que entra el Sol hasta el día anterior a su salida.
export const rangoSigno = (ctx, id) => {
  const t = ctx.temporadas[id];
  return `${diaMes(t.inicio)} – ${diaMes(new Date(t.fin.getTime() - 864e5))}`;
};
const estrellas = (n) => `<span class="stars" aria-label="${n} de 5">${'★'.repeat(n)}<span class="off">${'★'.repeat(5 - n)}</span></span>`;


const pairSlug = (a, b) => {
  const [x, y] = [a, b].sort((p, q) => SIGNOS_ORDEN.indexOf(p) - SIGNOS_ORDEN.indexOf(q));
  return `${x}-${y}`;
};

export function textoEvento(e) {
  const P = PLANETA_NOMBRE[e.body];
  if (e.tipo === 'retro') return `${P} retrógrado en ${N(e.signo)}`;
  if (e.tipo === 'directo') return `${P} retoma su marcha directa en ${N(e.signo)}`;
  if (e.tipo === 'ingreso' && e.body === 'Sun') return `El Sol entra en ${N(e.signo)}: comienza su temporada`;
  if (e.tipo === 'ingreso') return `${P} entra en ${N(e.signo)}`;
  if (e.tipo === 'fase') return `${e.nombre} en ${N(e.signo)}`;
  if (e.tipo === 'eclipse') return `Eclipse ${e.clase} ${e.detalle} en ${N(e.signo)}`;
  return '';
}

function listaEventos(ctx, desde, hasta) {
  return [
    ...ctx.eventos.map((e) => ({ ...e })),
    ...ctx.fases.filter((f) => f.id === 'nueva' || f.id === 'llena').map((f) => ({ fecha: f.fecha, tipo: 'fase', nombre: f.nombre, signo: f.signo })),
    ...ctx.eclipses.map((e) => ({ fecha: e.fecha, tipo: 'eclipse', clase: e.tipo, detalle: e.detalle, signo: e.signo })),
  ].filter((e) => e.fecha >= desde && e.fecha < hasta).sort((a, b) => a.fecha - b.fecha);
}

const etiquetaEvento = { retro: '℞ Retro', directo: 'Directo', ingreso: 'Ingreso', fase: 'Luna', eclipse: 'Eclipse' };

// ---------------- Portada ----------------
export function portada(ctx, opts = {}) {
  const { cielo, horoscopos } = ctx;
  const L = cielo.luna;
  const sol = cielo.posiciones.find((p) => p.body === 'Sun');
  const retros = cielo.posiciones.filter((p) => p.retro);
  const cambioHoy = fmt(L.cambioSigno, { day: 'numeric' }) === fmt(cielo.fecha, { day: 'numeric' });

  const proximos = listaEventos(ctx, ctx.ahora, new Date(ctx.ahora.getTime() + 60 * 864e5)).slice(0, 6);

  const contenido = `
<section class="sky"><div class="wrap">
  <div>
    <div class="eyebrow">${esc(ctx.fechaLarga)}</div>
    <h1>El cielo de hoy</h1>
    <p>La Luna está en <strong>${N(L.signo)}</strong>, ${L.fase.nombre.toLowerCase()} y ${Math.round(L.iluminacion * 100)}% iluminada${cambioHoy ? `. A las ${hora(L.cambioSigno)} pasa a <strong>${N(L.proximoSigno)}</strong>` : ''}.</p>
    <p>El Sol recorre <strong>${N(sol.signo)}</strong>. ${retros.length ? `Hay ${retros.length} planetas retrógrados: ${retros.map((p) => PLANETA_NOMBRE[p.body]).join(', ')}.` : 'No hay planetas retrógrados.'}</p>
    <ul class="sky-facts">${cielo.posiciones.map((p) => `<li><span class="glyph">${g(PLANETA_SIMBOLO[p.body])}</span> ${PLANETA_NOMBRE[p.body]} en ${N(p.signo)}${p.retro ? ' <span class="r">℞</span>' : ''}</li>`).join('')}</ul>
  </div>
  <div class="wheel-box">${ruedaZodiacal(cielo.posiciones)}</div>
</div></section>

<section class="section"><div class="wrap">
  <h2>Horóscopo de hoy para cada signo</h2>
  <p class="lead">Elige tu signo y lee cómo te afecta el cielo de hoy en el amor, el dinero y la salud.</p>
  <div class="signs">
  ${SIGNOS_ORDEN.map((id) => {
    const s = SIGNOS[id]; const h = horoscopos[id];
    return `<a class="sign-card ${s.elemento}" href="horoscopo/${id}.html">
      <span class="g glyph" aria-hidden="true">${g(s.simbolo)}</span><h3>${s.nombre}</h3><span class="d">${rangoSigno(ctx, id)}</span>
      <p class="t">${esc(h.titular)}</p><p class="s">${esc(resumen(h))}</p></a>`;
  }).join('')}
  </div>
  ${adSlot('portada', 'ad-wide')}
</div></section>

<section class="section"><div class="wrap">
  <div class="promos">
    <a class="promo" href="carta-natal.html"><span class="eyebrow">Nuevo · Carta natal</span><h3>Tu frase personal de cada día</h3><p>Ingresa tu fecha, hora y lugar de nacimiento: calculamos tu Sol, tu Luna y tu Ascendente, y cada día te damos una frase según tu carta.</p><span class="go">Calcular mi carta ›</span></a>
    <a class="promo" href="tarot-lenormand.html"><span class="eyebrow">Nuevo · Tarot Lenormand</span><h3>Tira 3 cartas</h3><p>Una tirada rápida con interpretación simple para el amor, el trabajo o en general. Hoy la carta del día es ${esc(ctx.cartaDelDia.nombre)}.</p><span class="go">Tirar las cartas ›</span></a>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <h2>Tránsitos de hoy</h2>
  <p class="lead">Posición de cada planeta en el zodíaco tropical, calculada para el mediodía de hoy.</p>
  <div class="table-wrap"><table>
    <thead><tr><th>Planeta</th><th>Signo</th><th>Posición</th><th>Movimiento</th></tr></thead>
    <tbody>${cielo.posiciones.map((p) => `<tr><td><span class="glyph">${g(PLANETA_SIMBOLO[p.body])}</span> ${PLANETA_NOMBRE[p.body]}</td><td><span class="glyph">${g(SIGNOS[p.signo].simbolo)}</span> ${N(p.signo)}</td><td class="num">${grados(p.grado)}</td><td>${p.retro ? '<span class="tag">℞ Retrógrado</span>' : 'Directo'}</td></tr>`).join('')}</tbody>
  </table></div>
</div></section>

<section class="section"><div class="wrap">
  <h2>Lo que viene en el cielo</h2>
  <p class="lead">Las próximas fechas importantes. <a href="calendario-astral.html">Ver el calendario astral completo</a>.</p>
  <div class="table-wrap"><table>
    <tbody>${proximos.map((e) => `<tr><td class="num">${diaCorto(e.fecha)}</td><td><span class="tag">${etiquetaEvento[e.tipo]}</span></td><td>${esc(textoEvento(e))}</td></tr>`).join('')}</tbody>
  </table></div>
</div></section>`;

  return pagina({
    titulo: `Horóscopo de hoy ${ctx.fechaCorta}: todos los signos | ${CONFIG.nombre}`,
    descripcion: `Horóscopo de hoy, ${ctx.fechaLarga.toLowerCase()}, para los 12 signos: amor, dinero y salud según la posición real de la Luna y los planetas.`,
    ruta: 'index.html', seccion: 'inicio', contenido, actualizado: ctx.actualizado, ...opts,
  });
}

// ---------------- Página de signo (hoy o mañana) ----------------
export function paginaSigno(ctx, id, { manana = false } = {}) {
  const s = SIGNOS[id];
  const h = manana ? ctx.horoscoposManana[id] : ctx.horoscopos[id];
  const cielo = manana ? ctx.cieloManana : ctx.cielo;
  const fechaTxt = manana ? ctx.fechaLargaManana : ctx.fechaLarga;
  const pos = Object.fromEntries(cielo.posiciones.map((p) => [p.body, p]));
  const retros = cielo.posiciones.filter((p) => p.retro && ['Mercury', 'Venus', 'Mars'].includes(p.body));
  const otros = SIGNOS_ORDEN.filter((x) => x !== id);
  const cuando = manana ? 'mañana' : 'hoy';

  const contenido = `
<div class="wrap narrow">
  <section class="sign-hero">
    <div class="crumbs"><a href="../index.html">Horóscopo</a> › ${s.nombre} › ${manana ? 'Mañana' : 'Hoy'}</div>
    <div class="head"><span class="big glyph ${s.elemento}" style="color:var(--${s.elemento})" aria-hidden="true">${g(s.simbolo)}</span>
      <div><h1>Horóscopo de ${s.nombre} ${cuando}</h1><p class="date">${esc(fechaTxt)} · ${rangoSigno(ctx, id)}</p></div></div>
    <nav class="chips" aria-label="Día" style="margin-top:18px">
      <a href="${id}.html"${manana ? '' : ' aria-current="page" style="border-color:var(--accent);color:var(--accent)"'}>Hoy</a>
      <a href="${id}-manana.html"${manana ? ' aria-current="page" style="border-color:var(--accent);color:var(--accent)"' : ''}>Mañana</a>
    </nav>
    <p class="verdict">${esc(h.titular)}</p>
    <div class="prose"><p>${esc(h.general)}</p></div>
    <div class="scores">
      <div class="score"><div class="l">Amor</div>${estrellas(h.puntajes.amor)}</div>
      <div class="score"><div class="l">Dinero</div>${estrellas(h.puntajes.dinero)}</div>
      <div class="score"><div class="l">Salud</div>${estrellas(h.puntajes.salud)}</div>
    </div>
  </section>

  <div class="areas">
    <div class="area"><h2>Amor</h2><p>${esc(h.amor)}</p></div>
    <div class="area"><h2>Dinero y trabajo</h2><p>${esc(h.dinero)}</p></div>
    ${adSlot('dentro del horóscopo')}
    <div class="area"><h2>Salud y bienestar</h2><p>${esc(h.salud)}</p></div>
  </div>

  <div class="lucky">
    <div><div class="l">Número de la suerte</div><div class="v mono">${h.numero}</div></div>
    <div><div class="l">Color</div><div class="v">${esc(h.color[0].toUpperCase() + h.color.slice(1))}</div></div>
    <div><div class="l">Signo afín ${cuando}</div><div class="v"><a href="${h.compatibleHoy}.html"><span class="glyph">${g(SIGNOS[h.compatibleHoy].simbolo)}</span> ${N(h.compatibleHoy)}</a></div></div>
  </div>

  <p class="advice">${esc(h.consejo)}</p>

  <aside class="why">
    <h2>Por qué tu día es así</h2>
    <ul>
      <li>La Luna transita ${N(pos.Moon.signo)}, tu casa ${h.claves.lunaCasa}: ${CASA_TEMA[h.claves.lunaCasa]}.</li>
      <li>Venus está en ${N(pos.Venus.signo)}, tu casa ${h.claves.venusCasa}: marca el tono del amor.</li>
      <li>Marte está en ${N(pos.Mars.signo)}, tu casa ${h.claves.marteCasa}: indica dónde pones tu energía y tu trabajo.</li>
      ${retros.map((p) => `<li>${PLANETA_NOMBRE[p.body]} está retrógrado en ${N(p.signo)}.</li>`).join('')}
    </ul>
  </aside>

  <section class="section profile" style="padding-top:36px">
    <h2>Cómo es ${s.nombre}</h2>
    <div class="prose"><p>${esc(s.perfil)}</p></div>
    <dl>
      <dt>Fechas</dt><dd>${rangoSigno(ctx, id)}</dd>
      <dt>Temporada ${fmt(ctx.temporadas[id].inicio, { year: 'numeric' })}</dt><dd>El Sol entra en ${s.nombre} el ${fmt(ctx.temporadas[id].inicio, { weekday: 'long' })} ${diaMes(ctx.temporadas[id].inicio)} a las ${hora(ctx.temporadas[id].inicio)} y pasa a ${N(SIGNOS_ORDEN[(SIGNOS_ORDEN.indexOf(id) + 1) % 12])} el ${diaMes(ctx.temporadas[id].fin)} a las ${hora(ctx.temporadas[id].fin)}.</dd>
      <dt>Elemento</dt><dd>${ELEMENTO[s.elemento]}</dd>
      <dt>Modalidad</dt><dd>${s.modalidad[0].toUpperCase() + s.modalidad.slice(1)}</dd>
      <dt>Planeta regente</dt><dd>${PLANETA_NOMBRE[s.regente]}</dd>
      <dt>Fortalezas</dt><dd>${esc(s.fortalezas)}</dd>
      <dt>Desafíos</dt><dd>${esc(s.debilidades)}</dd>
    </dl>
  </section>

  <section class="section">
    <h2>Compatibilidad de ${s.nombre}</h2>
    <p class="lead">Cómo se lleva ${s.nombre} con cada signo en el amor, la amistad y el trabajo.</p>
    <div class="chips">${SIGNOS_ORDEN.map((o) => `<a href="../compatibilidad/${pairSlug(id, o)}.html">${s.nombre} y ${N(o)} · ${compatibilidad(id, o).total}%</a>`).join('')}</div>
  </section>

  <section class="section">
    <h2>Otros signos</h2>
    <div class="signs-strip">${SIGNOS_ORDEN.map((o) => `<a href="${o}${manana ? '-manana' : ''}.html"${o === id ? ' aria-current="page"' : ''}><span class="glyph">${g(SIGNOS[o].simbolo)}</span>${N(o)}</a>`).join('')}</div>
  </section>
</div>`;

  return pagina({
    titulo: `Horóscopo de ${s.nombre} ${cuando}, ${manana ? ctx.fechaCortaManana : ctx.fechaCorta} | ${CONFIG.nombre}`,
    descripcion: `Horóscopo de ${s.nombre} para ${cuando}, ${fechaTxt.toLowerCase()}: amor, dinero, salud, número de la suerte y signo afín. ${h.titular}.`,
    ruta: `horoscopo/${id}${manana ? '-manana' : ''}.html`, base: '../', seccion: 'inicio', contenido, actualizado: ctx.actualizado,
    jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: `Horóscopo de ${s.nombre} ${cuando}`, datePublished: ctx.fechaISO, inLanguage: 'es', publisher: { '@type': 'Organization', name: CONFIG.nombre } },
  });
}

// ---------------- Luna hoy ----------------
const FASE_LARGA = {
  'nueva': 'La Luna no se ve en el cielo porque está entre la Tierra y el Sol. Astrológicamente es el inicio del ciclo: ideal para proponerse metas, empezar proyectos y escribir intenciones.',
  'creciente-iluminante': 'Aparece un hilo de luz al atardecer. Es la etapa de impulso: lo que se siembra en luna nueva empieza a crecer, y conviene dar los primeros pasos concretos.',
  'cuarto-creciente': 'Se ve la mitad de la Luna iluminada. Es un momento de decisiones y de superar obstáculos: la energía pide acción y compromiso.',
  'gibosa-creciente': 'La Luna está casi llena. Es tiempo de ajustar, corregir y perfeccionar antes de ver los resultados.',
  'llena': 'La Luna se ve completa toda la noche. Es el punto máximo del ciclo: las emociones se intensifican, se cosechan resultados y salen verdades a la luz.',
  'gibosa-menguante': 'La luz empieza a disminuir. Es momento de agradecer, compartir lo aprendido y repartir lo cosechado.',
  'cuarto-menguante': 'Se ve la otra mitad iluminada, de madrugada. Es tiempo de soltar, limpiar y cerrar lo que ya cumplió su ciclo.',
  'menguante': 'Queda apenas un hilo de luz antes del amanecer. Es la etapa de descanso y balance antes de la próxima luna nueva.',
};

export function paginaLuna(ctx) {
  const L = ctx.cielo.luna;
  const contenido = `
<section class="sky"><div class="wrap">
  <div>
    <div class="eyebrow">${esc(ctx.fechaLarga)}</div>
    <h1>${L.fase.nombre} en ${N(L.signo)}</h1>
    <p>${esc(FASE_LARGA[L.fase.id])}</p>
    <div class="moon-stats">
      <div><div class="l">Iluminación</div><div class="v mono">${Math.round(L.iluminacion * 100)}%</div></div>
      <div><div class="l">Signo</div><div class="v">${N(L.signo)} ${grados(L.grado)}</div></div>
      <div><div class="l">Pasa a ${N(L.proximoSigno)}</div><div class="v">${diaCorto(L.cambioSigno)}, ${hora(L.cambioSigno)} h</div></div>
    </div>
  </div>
  <div>${dibujoLuna(L, { size: 260, clase: 'moon-big', hemisferioSur: true })}</div>
</div></section>

<div class="wrap">
  <section class="section">
    <h2>Próximas fases de la Luna</h2>
    <p class="lead">Fechas y horas en hora de ${esc(CONFIG.pais)}.</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Hora</th><th>Fase</th><th>Signo</th></tr></thead>
      <tbody>${ctx.fases.slice(0, 8).map((f) => `<tr><td class="num">${fmt(f.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}</td><td class="num">${hora(f.fecha)}</td><td>${f.nombre}</td><td><span class="glyph">${g(SIGNOS[f.signo].simbolo)}</span> ${N(f.signo)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>
  ${adSlot('luna')}
  <section class="section">
    <h2>Próximos eclipses</h2>
    <p class="lead">Momento de máxima intensidad de cada eclipse.</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Eclipse</th><th>Signo</th></tr></thead>
      <tbody>${ctx.eclipses.map((e) => `<tr><td class="num">${fmt(e.fecha, { day: 'numeric', month: 'long', year: 'numeric' })}</td><td>${e.tipo === 'solar' ? 'Solar' : 'Lunar'} ${e.detalle}</td><td><span class="glyph">${g(SIGNOS[e.signo].simbolo)}</span> ${N(e.signo)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>
</div>`;
  return pagina({
    titulo: `Luna hoy: ${L.fase.nombre.toLowerCase()} en ${N(L.signo)} | ${CONFIG.nombre}`,
    descripcion: `Cómo está la Luna hoy, ${ctx.fechaLarga.toLowerCase()}: ${L.fase.nombre.toLowerCase()} en ${N(L.signo)}, ${Math.round(L.iluminacion * 100)}% iluminada. Próximas lunas llenas, nuevas y eclipses.`,
    ruta: 'luna-hoy.html', seccion: 'luna', contenido, actualizado: ctx.actualizado,
  });
}

// ---------------- Calendario astral ----------------
export function paginaCalendario(ctx) {
  const eventos = listaEventos(ctx, ctx.ahora, ctx.hasta);
  const meses = new Map();
  for (const e of eventos) {
    const k = fmt(e.fecha, { month: 'long', year: 'numeric' });
    if (!meses.has(k)) meses.set(k, []);
    meses.get(k).push(e);
  }
  const contenido = `
<div class="wrap narrow">
  <section class="section">
    <div class="eyebrow" style="color:var(--accent)">Próximos 12 meses</div>
    <h1 style="font:600 clamp(2rem,5vw,2.8rem)/1.05 var(--font-display);margin:8px 0 10px">Calendario astral</h1>
    <p class="lead">Retrógrados, cambios de signo, lunas nuevas, lunas llenas y eclipses, calculados con efemérides reales. Horarios de ${esc(CONFIG.pais)}.</p>
  </section>
  ${[...meses].map(([mes, lista], i) => `
  <section class="section">
    <h2 style="text-transform:capitalize">${mes}</h2>
    <div class="table-wrap"><table><tbody>
    ${lista.map((e) => `<tr><td class="num">${fmt(e.fecha, { weekday: 'short', day: 'numeric' })}</td><td class="num">${hora(e.fecha)}</td><td><span class="tag">${etiquetaEvento[e.tipo]}</span></td><td>${esc(textoEvento(e))}</td></tr>`).join('')}
    </tbody></table></div>
    ${i === 1 ? adSlot('calendario') : ''}
  </section>`).join('')}
</div>`;
  const retro = eventos.find((e) => e.body === 'Mercury' && e.tipo === 'retro');
  return pagina({
    titulo: `Calendario astral ${fmt(ctx.ahora, { year: 'numeric' })}: retrógrados, lunas y eclipses | ${CONFIG.nombre}`,
    descripcion: `Calendario astrológico de los próximos 12 meses: Mercurio retrógrado${retro ? ` (desde el ${fmt(retro.fecha, { day: 'numeric', month: 'long' })})` : ''}, lunas llenas, lunas nuevas, eclipses y cambios de signo.`,
    ruta: 'calendario-astral.html', seccion: 'calendario', contenido, actualizado: ctx.actualizado,
  });
}

// ---------------- Compatibilidad ----------------
function selector(base, a = 'aries', b = 'libra') {
  const opts = (sel) => SIGNOS_ORDEN.map((id) => `<option value="${id}"${id === sel ? ' selected' : ''}>${N(id)}</option>`).join('');
  return `<form class="picker" id="picker">
  <label for="sa">Tu signo<select id="sa">${opts(a)}</select></label>
  <label for="sb">Su signo<select id="sb">${opts(b)}</select></label>
  <button class="btn" type="submit">Ver compatibilidad</button>
</form>
<script>
(function(){var o=${JSON.stringify(SIGNOS_ORDEN)};document.getElementById('picker').addEventListener('submit',function(e){e.preventDefault();
var a=document.getElementById('sa').value,b=document.getElementById('sb').value;var p=[a,b].sort(function(x,y){return o.indexOf(x)-o.indexOf(y)});
if(window.gtag)gtag('event','compatibilidad',{pareja:p[0]+'-'+p[1]});
location.href='${base}compatibilidad/'+p[0]+'-'+p[1]+'.html';});})();
</script>`;
}

export function paginaCompatibilidadIndice(ctx) {
  const contenido = `
<div class="wrap">
  <section class="section">
    <h1 style="font:600 clamp(2rem,5vw,2.8rem)/1.05 var(--font-display);margin:0 0 10px">Compatibilidad de signos</h1>
    <p class="lead">Elige los dos signos y descubre cómo se llevan en el amor, la amistad y el trabajo. En cada pareja puedes tocar cada área para leer el detalle.</p>
    ${selector('')}
  </section>
  <section class="section">
    <h2>Tabla de compatibilidad</h2>
    <p class="lead">Porcentaje general de cada combinación. Toca un número para leer el detalle.</p>
    <div class="table-wrap"><table class="matrix">
      <thead><tr><th></th>${SIGNOS_ORDEN.map((id) => `<th title="${N(id)}"><span class="glyph">${g(SIGNOS[id].simbolo)}</span></th>`).join('')}</tr></thead>
      <tbody>${SIGNOS_ORDEN.map((a) => `<tr><th style="text-align:left">${N(a)}</th>${SIGNOS_ORDEN.map((b) => { const c = compatibilidad(a, b); return `<td><a href="compatibilidad/${pairSlug(a, b)}.html" class="${c.total >= 80 ? 'hi' : ''}" title="${N(a)} y ${N(b)}">${c.total}</a></td>`; }).join('')}</tr>`).join('')}</tbody>
    </table></div>
    ${adSlot('compatibilidad', 'ad-wide')}
  </section>
</div>`;
  return pagina({
    titulo: `Compatibilidad de signos: tabla completa | ${CONFIG.nombre}`,
    descripcion: 'Compatibilidad entre los 12 signos del zodíaco en el amor, la amistad y el trabajo. Tabla completa y análisis de cada pareja.',
    ruta: 'compatibilidad.html', seccion: 'compat', contenido, actualizado: ctx.actualizado,
  });
}

export function paginaPareja(ctx, a, b) {
  const c = compatibilidad(a, b);
  const A = SIGNOS[a], B = SIGNOS[b];
  const titulo = a === b ? `${A.nombre} y ${A.nombre}` : `${A.nombre} y ${B.nombre}`;
  // Detalle de cada área: texto de la IA si ya está generado, o el de reglas.
  const d = ctx.compatIA?.[pairSlug(a, b)] || c.detalle;
  const barra = (lbl, v, texto) => `<details class="bar"><summary><div class="row"><span>${lbl} <span class="more" aria-hidden="true">Ver más</span></span><b>${v}%</b></div><div class="track"><div class="fill" style="width:${v}%"></div></div></summary><p>${esc(texto)}</p></details>`;
  const contenido = `
<div class="wrap narrow">
  <section class="sign-hero">
    <div class="crumbs"><a href="../compatibilidad.html">Compatibilidad</a> › ${titulo}</div>
    <div class="pair-head">
      <span class="big glyph" style="color:var(--${A.elemento})">${g(A.simbolo)}</span><span class="big glyph" style="color:var(--${B.elemento})">${g(B.simbolo)}</span>
      <h1>Compatibilidad ${titulo}</h1>
      <span class="pct mono">${c.total}%</span>
    </div>
    <div class="bars">${barra('Amor', c.amor, d.amor)}${barra('Amistad', c.amistad, d.amistad)}${barra('Trabajo', c.trabajo, d.trabajo)}</div>
    <p class="advice">${esc(d.consejo)}</p>
    <div class="prose">
      <p>${esc(c.texto)}</p>
      <p>${A.nombre} es de ${ELEMENTO[A.elemento].toLowerCase()} y ${B.nombre} es de ${ELEMENTO[B.elemento].toLowerCase()}. ${esc(c.elementoTexto)}</p>
      <p>${esc(c.modalidadTexto)}</p>
    </div>
  </section>
  ${adSlot('compatibilidad')}
  <section class="section">
    <h2>Otra combinación</h2>
    ${selector('../', a, b)}
  </section>
  <section class="section">
    <h2>Horóscopo de hoy</h2>
    <div class="chips"><a href="../horoscopo/${a}.html">${A.nombre} hoy</a>${a !== b ? `<a href="../horoscopo/${b}.html">${B.nombre} hoy</a>` : ''}</div>
  </section>
</div>`;
  return pagina({
    titulo: `Compatibilidad ${titulo}: amor, amistad y trabajo | ${CONFIG.nombre}`,
    descripcion: `¿Son compatibles ${titulo}? ${c.total}% de compatibilidad. Cómo se llevan en el amor (${c.amor}%), la amistad y el trabajo.`,
    ruta: `compatibilidad/${pairSlug(a, b)}.html`, base: '../', seccion: 'compat', contenido, actualizado: ctx.actualizado,
  });
}

export { pairSlug };
export const pares = () => {
  const out = [];
  SIGNOS_ORDEN.forEach((a, i) => SIGNOS_ORDEN.slice(i).forEach((b) => out.push([a, b])));
  return out;
};

// ---------------- Privacidad ----------------
export function paginaPrivacidad(ctx) {
  const contenido = `
<div class="wrap narrow">
  <section class="section prose">
    <div class="eyebrow" style="color:var(--accent)">Última actualización: 13 de noviembre de 2026</div>
    <h1 style="font:400 clamp(1.76rem,4.4vw,2.46rem)/1.1 var(--font-display);margin:8px 0 18px">Política de privacidad</h1>
    <p>${esc(CONFIG.nombre)} no pide registrarse ni crear una cuenta. Esta página explica qué datos se usan y para qué.</p>

    <h2>Tu carta natal queda en tu dispositivo</h2>
    <p>La fecha, la hora y el lugar de nacimiento que cargas en la carta natal se calculan en tu propio navegador y se guardan solo ahí (en el almacenamiento local), para mostrarte tu frase del día cuando vuelves. No se envían a nuestros servidores. Puedes borrarlos cuando quieras con el botón «Borrar mis datos» de esa página.</p>

    <h2>Estadísticas de uso</h2>
    <p>Usamos Google Analytics para saber cuántas personas visitan el sitio, desde qué países y dispositivos, qué páginas leen y qué secciones usan (por ejemplo, si hacen una tirada de tarot). Google Analytics usa cookies y no nos muestra quién eres.</p>
    <p>Cuando calculas tu carta natal registramos solamente tu signo solar y un rango de edad (por ejemplo, «25-34»), nunca la fecha, la hora ni el lugar de nacimiento. Nos sirve para saber qué público usa el sitio.</p>
    <p>Si no quieres que te midamos, puedes bloquear las cookies en tu navegador o instalar el <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">complemento de inhabilitación de Google Analytics</a>.</p>

    <h2>Publicidad</h2>
    <p>El sitio se mantiene con publicidad. Google y sus socios pueden usar cookies para mostrar anuncios según tus visitas a este y otros sitios. Puedes ver cómo lo hace Google en <a href="https://policies.google.com/technologies/ads?hl=es" rel="noopener">su página sobre publicidad</a> y elegir qué anuncios ver en <a href="https://myadcenter.google.com/" rel="noopener">Mi Centro de anuncios</a>.</p>

    <h2>Tus derechos</h2>
    <p>Según la Ley 25.326 de Protección de Datos Personales puedes pedir acceso, corrección o eliminación de tus datos${CONFIG.contacto ? ` escribiendo a <a href="mailto:${esc(CONFIG.contacto)}">${esc(CONFIG.contacto)}</a>` : ''}.</p>
    <p class="note">El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.</p>
  </section>
</div>`;
  return pagina({
    titulo: `Política de privacidad | ${CONFIG.nombre}`,
    descripcion: `Qué datos usa ${CONFIG.nombre}, para qué y cómo borrarlos.`,
    ruta: 'privacidad.html', contenido, actualizado: ctx.actualizado,
  });
}
