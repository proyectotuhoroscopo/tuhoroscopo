// Carta natal en el navegador: calcula, dibuja y guarda los datos en este dispositivo
// para mostrar la frase del día cada vez que la persona vuelve.
import { cartaNatal, fraseDelDia, utcDesdeLocal } from '../natal.mjs';
import { SIGNOS, PLANETA_NOMBRE, PLANETA_SIMBOLO, CASA_TEMA } from '../data/signos.mjs';
import { LUNA_EN, ASC_EN } from '../data/natal.mjs';
import { CIUDADES } from '../data/ciudades.mjs';
import { ruedaZodiacal } from '../render/svg.mjs';
import { esc, g } from '../render/layout.mjs';

const GUARDADO = 'tuhoroscopo:natal';
const form = document.getElementById('natal');
const $ = (id) => document.getElementById(id);
const N = (id) => SIGNOS[id].nombre;
let FRASES_IA = {};
try { FRASES_IA = JSON.parse($('frases-ia').textContent); } catch { /* sin frases de IA: se usa el banco fijo */ }
const grados = (x) => `${Math.floor(x)}°${String(Math.floor((x % 1) * 60)).padStart(2, '0')}′`;

const leer = () => { try { return JSON.parse(localStorage.getItem(GUARDADO)); } catch { return null; } };
const guardar = (d) => { try { localStorage.setItem(GUARDADO, JSON.stringify(d)); } catch { /* sin almacenamiento: igual se muestra */ } };
const borrar = () => { try { localStorage.removeItem(GUARDADO); } catch { /* nada que borrar */ } };

const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function mostrar(datos) {
  const [gi, i] = datos.ciudad.split(':').map(Number);
  const [lugar, lat, lon, tz] = CIUDADES[gi][1][i];
  const [y, m, d] = datos.fecha.split('-').map(Number);
  const [h, mi] = (datos.sinHora ? '12:00' : datos.hora || '12:00').split(':').map(Number);
  const carta = cartaNatal({ fecha: utcDesdeLocal(y, m, d, h, mi, tz), lat, lon, conHora: !datos.sinHora });

  // Frase del día
  const ahora = new Date();
  const f = fraseDelDia(carta, ahora, hoyLocal(), FRASES_IA[hoyLocal()]);
  $('frase-fecha').textContent = `Tu frase de hoy · ${new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(ahora)}`;
  $('frase').textContent = f.frase;
  $('frase-por-que').innerHTML = `Hoy la Luna está en ${N(f.signoLuna)} y pasa por tu casa ${f.casa}${f.desdeAsc ? '' : ' solar'}: ${CASA_TEMA[f.casa]}.${f.aspecto ? ` ${esc(f.aspecto)}` : ''} <a href="horoscopo/${carta.sol.signo}.html">Leer el horóscopo de ${N(carta.sol.signo)} hoy</a>.`;

  // Sol, Luna y Ascendente
  const pilar = (titulo, signo, texto) => `<div class="pillar ${SIGNOS[signo].elemento}"><span class="g glyph" aria-hidden="true">${g(SIGNOS[signo].simbolo)}</span><div class="l">${titulo}</div><h3>${N(signo)}</h3><p>${esc(texto)}</p></div>`;
  const lunaTxt = carta.lunaDudosa
    ? `Ese día la Luna pasó de ${N(carta.lunaDudosa[0])} a ${N(carta.lunaDudosa[1])}; sin la hora exacta no podemos saber en cuál estaba. ${LUNA_EN[carta.luna.signo]}`
    : LUNA_EN[carta.luna.signo];
  $('pilares').innerHTML = [
    pilar('Sol · tu esencia', carta.sol.signo, SIGNOS[carta.sol.signo].perfil),
    pilar('Luna · tus emociones', carta.luna.signo, lunaTxt),
    carta.asc
      ? pilar('Ascendente · cómo te ven', carta.asc.signo, ASC_EN[carta.asc.signo])
      : '<div class="pillar"><div class="l">Ascendente</div><h3>Falta la hora</h3><p>El Ascendente cambia cada dos horas aproximadamente. Si consigues tu hora de nacimiento (figura en la partida de nacimiento), vuelve a calcular la carta.</p></div>',
  ].join('');

  // Rueda y tabla de planetas
  $('cielo-lead').textContent = `${lugar}, ${new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d, 12)))}${datos.sinHora ? ' (sin hora: calculado al mediodía)' : `, ${datos.hora} h`}.`;
  $('rueda').innerHTML = ruedaZodiacal(carta.posiciones, { asc: carta.asc?.lon ?? null, etiqueta: 'Tu carta natal' });
  $('th-casa').hidden = !carta.asc;
  const filas = carta.posiciones.map((p) => `<tr><td><span class="glyph">${g(PLANETA_SIMBOLO[p.body])}</span> ${PLANETA_NOMBRE[p.body]}</td><td><span class="glyph">${g(SIGNOS[p.signo].simbolo)}</span> ${N(p.signo)}${p.retro ? ' <span class="tag">℞</span>' : ''}</td><td class="num">${grados(p.grado)}</td>${carta.asc ? `<td class="num" title="${CASA_TEMA[p.casa]}">${p.casa}</td>` : ''}</tr>`);
  if (carta.asc) filas.unshift(`<tr><td><b>Ascendente</b></td><td><span class="glyph">${g(SIGNOS[carta.asc.signo].simbolo)}</span> ${N(carta.asc.signo)}</td><td class="num">${grados(carta.asc.grado)}</td><td class="num">1</td></tr>`, `<tr><td><b>Medio Cielo</b></td><td><span class="glyph">${g(SIGNOS[carta.mc.signo].simbolo)}</span> ${N(carta.mc.signo)}</td><td class="num">${grados(carta.mc.grado)}</td><td></td></tr>`);
  $('planetas').innerHTML = filas.join('');

  $('resultado').hidden = false;
  $('borrar').hidden = false;
}

function llenar(datos) {
  form.fecha.value = datos.fecha;
  form.hora.value = datos.hora || '12:00';
  form.sinHora.checked = Boolean(datos.sinHora);
  form.hora.disabled = form.sinHora.checked;
  form.ciudad.value = datos.ciudad;
}

form.sinHora.addEventListener('change', () => { form.hora.disabled = form.sinHora.checked; });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.fecha.value) return;
  const datos = { fecha: form.fecha.value, hora: form.hora.value, sinHora: form.sinHora.checked, ciudad: form.ciudad.value };
  guardar(datos);
  mostrar(datos);
  $('resultado').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

$('borrar').addEventListener('click', () => {
  borrar();
  form.reset();
  form.hora.disabled = false;
  $('resultado').hidden = true;
  $('borrar').hidden = true;
});

// Si ya cargó sus datos antes, la frase de hoy aparece apenas entra.
const previo = leer();
if (previo?.fecha && previo?.ciudad) {
  try { llenar(previo); mostrar(previo); } catch { borrar(); }
}
