// Carta natal: el formulario se genera con el sitio y el cálculo se hace en el navegador.
import CONFIG from '../../config.mjs';
import { CIUDADES } from '../data/ciudades.mjs';
import { pagina, adSlot, esc } from './layout.mjs';

export function paginaCartaNatal(ctx) {
  const opciones = CIUDADES.map(([pais, lista], gi) => `<optgroup label="${esc(pais)}">${lista.map(([nombre], i) => `<option value="${gi}:${i}"${gi === 0 && i === 0 ? ' selected' : ''}>${esc(nombre)}</option>`).join('')}</optgroup>`).join('');
  const contenido = `
<section class="sky"><div class="wrap natal-hero">
  <div>
    <div class="eyebrow">Carta natal gratis</div>
    <h1>Tu carta natal y tu frase del día</h1>
    <p>Con tu fecha, hora y lugar de nacimiento calculamos dónde estaban el Sol, la Luna y los planetas en el momento exacto en que naciste. Cada día te damos una frase según por dónde pasa la Luna en tu carta.</p>
  </div>
</div></section>

<div class="wrap narrow">
  <div id="resultado" hidden>
    <section class="today-quote" aria-live="polite">
      <div class="eyebrow" id="frase-fecha"></div>
      <p class="q" id="frase"></p>
      <p class="why-line" id="frase-por-que"></p>
    </section>

    <section class="section">
      <h2>Tus tres pilares</h2>
      <div class="pillars" id="pilares"></div>
    </section>

    ${adSlot('carta natal')}

    <section class="section">
      <h2>Tu cielo al nacer</h2>
      <p class="lead" id="cielo-lead"></p>
      <div class="natal-grid">
        <div class="wheel-box" id="rueda"></div>
        <div class="table-wrap"><table><thead><tr><th>Planeta</th><th>Signo</th><th>Grado</th><th id="th-casa">Casa</th></tr></thead><tbody id="planetas"></tbody></table></div>
      </div>
    </section>
  </div>
  <section class="section">
    <form class="natal-form" id="natal">
      <label>Fecha de nacimiento<input type="date" name="fecha" required min="1900-01-01" max="${ctx.fechaISO}"></label>
      <label>Hora<input type="time" name="hora" value="12:00"></label>
      <label class="check"><input type="checkbox" name="sinHora"> No sé la hora</label>
      <label class="wide">Lugar de nacimiento<select name="ciudad">${opciones}</select></label>
      <p class="hint wide">Si tu ciudad no está, elige la más cercana. Tus datos se guardan solo en este dispositivo para mostrarte tu frase cada día: no se envían a ningún lado.</p>
      <div class="wide actions"><button class="btn" type="submit">Calcular mi carta</button><button class="linkish" type="button" id="borrar" hidden>Borrar mis datos</button></div>
    </form>
  </section>

  <p class="note">Usamos el zodíaco tropical y casas por signo entero, con efemérides astronómicas reales. Es contenido de entretenimiento.</p>
</div>
<script type="importmap">{"imports":{"astronomy-engine":"./js/astronomy.mjs"}}</script>
<script type="module" src="js/src/cliente/carta.mjs"></script>`;

  return pagina({
    titulo: `Carta natal gratis online: Sol, Luna y Ascendente | ${CONFIG.nombre}`,
    descripcion: 'Calcula gratis tu carta natal con fecha, hora y lugar de nacimiento: tu signo solar, tu Luna, tu Ascendente y la posición de cada planeta. Además, una frase personalizada cada día.',
    ruta: 'carta-natal.html', seccion: 'natal', contenido, actualizado: ctx.actualizado,
  });
}
