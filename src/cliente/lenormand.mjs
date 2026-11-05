// Tirada de 3 cartas en el navegador: mezcla el mazo, da vuelta las cartas una por una y arma la lectura.
import { CARTAS } from '../data/lenormand.mjs';
import { caraCarta, lectura } from '../render/lenormand.mjs';
import { esc } from '../render/layout.mjs';

const form = document.getElementById('tirada');
const slots = [...document.querySelectorAll('#spread .slot')];
const caja = document.getElementById('reading');
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

function tresAlAzar() {
  const mazo = [...CARTAS];
  const r = new Uint32Array(mazo.length);
  crypto.getRandomValues(r);
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = r[i] % (i + 1);
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  return mazo.slice(0, 3);
}

const espera = (ms) => new Promise((res) => setTimeout(res, quieto ? 0 : ms));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const boton = form.querySelector('button');
  const tema = new FormData(form).get('tema');
  boton.disabled = true;
  caja.hidden = true;
  const cartas = tresAlAzar();
  slots.forEach((s) => { s.classList.remove('open'); s.querySelector('.sig').innerHTML = ''; });
  await espera(350);
  for (const [i, c] of cartas.entries()) {
    const s = slots[i];
    const flip = s.querySelector('.lflip');
    flip.querySelector('.lcard')?.remove();
    flip.insertAdjacentHTML('beforeend', caraCarta(c, { href: `lenormand/${c.id}.html` }));
    s.classList.add('open');
    s.querySelector('.sig').innerHTML = `<b>${esc(c.nombre)}</b><p>${esc(c[tema])}</p>`;
    await espera(650);
  }
  const l = lectura(cartas, tema);
  caja.innerHTML = `<h2>Tu lectura · ${esc(l.tema)}</h2>
    <p class="frase">${esc(l.frase)}</p>
    <p><span class="tag">${esc(l.tendencia)}</span> ${esc(l.detalle)}</p>
    <p class="advice" style="margin:0">${esc(l.consejo)}</p>`;
  caja.hidden = false;
  boton.textContent = 'Tirar de nuevo';
  boton.disabled = false;
  caja.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'nearest' });
});
