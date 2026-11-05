// Gráficos generados a partir del cielo real: rueda zodiacal y fase lunar.
import { SIGNOS_ORDEN } from '../astro.mjs';
import { SIGNOS, PLANETA_SIMBOLO, PLANETA_NOMBRE } from '../data/signos.mjs';
import { g } from './layout.mjs';

const rad = (d) => (d * Math.PI) / 180;
// Aries a la izquierda (ascendente) y los signos avanzan en sentido antihorario, como en una carta astral.
const puntoBase = (cx, cy, r, lon) => [cx - r * Math.cos(rad(lon)), cy + r * Math.sin(rad(lon))];
const f = (n) => n.toFixed(1);

// asc: en una carta natal, la rueda gira para que el Ascendente quede a la izquierda.
export function ruedaZodiacal(posiciones, { asc = null, etiqueta = 'Rueda zodiacal con la posición actual de los planetas' } = {}) {
  const cx = 160, cy = 160, R = 150, r1 = 118, r2 = 100;
  const giro = asc ?? 0;
  const punto = (cx, cy, r, lon) => puntoBase(cx, cy, r, lon - giro);
  let s = `<svg class="wheel" viewBox="0 0 320 320" role="img" aria-label="${etiqueta}">`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-opacity=".25"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="currentColor" stroke-opacity=".25"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="currentColor" stroke-opacity=".12"/>`;
  SIGNOS_ORDEN.forEach((id, i) => {
    const [x1, y1] = punto(cx, cy, r1, i * 30);
    const [x2, y2] = punto(cx, cy, R, i * 30);
    s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="currentColor" stroke-opacity=".25"/>`;
    const [gx, gy] = punto(cx, cy, (R + r1) / 2, i * 30 + 15);
    s += `<text x="${f(gx)}" y="${f(gy)}" text-anchor="middle" dominant-baseline="central" font-size="17" class="glyph" fill="var(--${SIGNOS[id].elemento})">${g(SIGNOS[id].simbolo)}</text>`;
  });
  // Marcas cada 10°
  for (let d = 0; d < 360; d += 10) {
    if (d % 30 === 0) continue;
    const [a, b] = punto(cx, cy, r1, d); const [c, e] = punto(cx, cy, r1 - 5, d);
    s += `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(e)}" stroke="currentColor" stroke-opacity=".3"/>`;
  }
  // Planetas: si quedan muy juntos se escalonan hacia adentro.
  const orden = [...posiciones].sort((a, b) => a.lon - b.lon);
  const niveles = [];
  orden.forEach((p, i) => {
    const prev = orden[i - 1];
    niveles[i] = prev && p.lon - prev.lon < 9 ? (niveles[i - 1] + 1) % 3 : 0;
  });
  orden.forEach((p, i) => {
    const rp = 84 - niveles[i] * 20;
    const [tx, ty] = punto(cx, cy, r1, p.lon);
    const [ux, uy] = punto(cx, cy, r1 - 9, p.lon);
    const [px, py] = punto(cx, cy, rp, p.lon);
    const color = p.body === 'Sun' || p.body === 'Moon' ? 'var(--gold)' : 'currentColor';
    s += `<line x1="${f(tx)}" y1="${f(ty)}" x2="${f(ux)}" y2="${f(uy)}" stroke="${color}" stroke-width="2"/>`;
    s += `<text x="${f(px)}" y="${f(py)}" text-anchor="middle" dominant-baseline="central" font-size="${p.body === 'Sun' || p.body === 'Moon' ? 19 : 15}" class="glyph" fill="${color}"><title>${PLANETA_NOMBRE[p.body]} en ${SIGNOS[p.signo].nombre}${p.retro ? ' (retrógrado)' : ''}</title>${g(PLANETA_SIMBOLO[p.body])}</text>`;
  });
  if (asc !== null) {
    const [ax, ay] = punto(cx, cy, R + 2, asc); const [bx, by] = punto(cx, cy, r2 - 14, asc);
    s += `<line x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(by)}" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    const [lx, ly] = punto(cx, cy, r2 - 4, asc - 8);
    s += `<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" dominant-baseline="central" font-size="10" font-family="var(--font-data)" fill="var(--gold)">AC</text>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="3" fill="var(--gold)"/>`;
  return s + '</svg>';
}

// Luna dibujada con su iluminación real. En el hemisferio sur la parte iluminada se ve invertida.
export function dibujoLuna(luna, { size = 120, hemisferioSur = true, clase = '' } = {}) {
  const r = 46, cx = 50, cy = 50;
  const k = luna.iluminacion;
  const creciente = luna.angulo < 180;
  const derecha = creciente !== hemisferioSur;
  const rx = Math.abs(1 - 2 * k) * r;
  const sweep = k < 0.5 ? 0 : 1;
  const lit = `M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} A${f(rx)},${r} 0 0 ${sweep} ${cx},${cy - r} Z`;
  return `<svg class="${clase}" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${luna.fase.nombre}, ${Math.round(k * 100)}% iluminada">
<defs><radialGradient id="lg" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fbf3dc"/><stop offset="1" stop-color="#d9c99f"/></radialGradient></defs>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2a2e52"/>
<g transform="${derecha ? '' : `translate(100,0) scale(-1,1)`}"><path d="${lit}" fill="url(#lg)"/></g>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fbf3dc" stroke-opacity=".25"/>
</svg>`;
}
