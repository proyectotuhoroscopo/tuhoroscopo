// "Mi signo": se guarda en este dispositivo cuando la persona lo elige (compatibilidad, carta natal
// o la página de un signo) y se usa en el resto del sitio para mostrarle primero lo suyo.
import { SIGNOS, CASA_TEMA } from '../data/signos.mjs';

const CLAVE = 'tuhoroscopo:signo';
const ORDEN = Object.keys(SIGNOS);

export const leerSigno = () => { try { const s = localStorage.getItem(CLAVE); return SIGNOS[s] ? s : null; } catch { return null; } };

export function guardarSigno(id, origen) {
  if (!SIGNOS[id] || id === leerSigno()) return;
  try { localStorage.setItem(CLAVE, id); } catch { return; }
  window.gtag?.('set', 'user_properties', { signo_solar: id });
  window.gtag?.('event', 'mi_signo', { signo_solar: id, origen });
  aplicar();
}

function olvidar() {
  try { localStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
  aplicar();
}

// Portada: bloque con el titular de hoy y por qué casa pasa la Luna, y la tarjeta del signo marcada.
function portada(mio) {
  const caja = document.getElementById('mi-signo');
  if (!caja) return;
  document.querySelectorAll('.sign-card').forEach((a) => a.classList.toggle('mine', a.dataset.signo === mio));
  caja.hidden = !mio;
  if (!mio) return;
  const s = SIGNOS[mio];
  const luna = caja.dataset.luna;
  const casa = ((ORDEN.indexOf(luna) - ORDEN.indexOf(mio) + 12) % 12) + 1;
  const titular = document.querySelector(`.sign-card[data-signo="${mio}"] .t`)?.textContent || '';
  caja.className = `mi-signo ${s.elemento}`;
  caja.innerHTML = `<span class="g glyph" aria-hidden="true">${s.simbolo}︎</span>
    <div><div class="eyebrow">Tu signo · ${s.nombre}</div>
    <p class="t">${titular}</p>
    <p class="s">La Luna hoy en ${SIGNOS[luna].nombre} pasa por tu casa ${casa}: ${CASA_TEMA[casa]}.</p>
    <p class="go"><a href="horoscopo/${mio}.html">Leer tu horóscopo de hoy ›</a> <a href="horoscopo/${mio}-manana.html">Mañana ›</a>
    <button class="linkish" type="button" data-olvidar>No es mi signo</button></p></div>`;
  caja.querySelector('[data-olvidar]').addEventListener('click', olvidar);
}

// Página de un signo: botón para elegirlo como propio.
function botonSigno(mio) {
  const b = document.querySelector('[data-mi-signo]');
  if (!b) return;
  const esMio = b.dataset.miSigno === mio;
  b.hidden = false;
  b.disabled = esMio;
  b.textContent = esMio ? '★ Es tu signo' : '☆ Es mi signo';
}

function aplicar() {
  const mio = leerSigno();
  portada(mio);
  botonSigno(mio);
}

// Compatibilidad: "Tu signo" viene elegido, y lo que se elija ahí queda guardado.
const tuyo = document.getElementById('sa');
if (tuyo) {
  const mio = leerSigno();
  if (mio && tuyo.dataset.mio !== undefined) tuyo.value = mio;
  document.getElementById('picker')?.addEventListener('submit', () => guardarSigno(tuyo.value, 'compatibilidad'));
}
document.querySelector('[data-mi-signo]')?.addEventListener('click', (e) => guardarSigno(e.currentTarget.dataset.miSigno, 'pagina_signo'));
aplicar();
