// Cálculos astronómicos reales (zodíaco tropical) con astronomy-engine.
import * as A from 'astronomy-engine';

export const SIGNOS_ORDEN = [
  'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo',
  'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis',
];

export const PLANETAS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const RETROGRADABLES = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const DIA = 86400000;

const norm = (x) => ((x % 360) + 360) % 360;

// Longitud eclíptica geocéntrica de fecha (en grados).
export function longitud(body, date) {
  if (body === 'Moon') return norm(A.EclipticGeoMoon(date).lon);
  if (body === 'Sun') return norm(A.SunPosition(date).elon);
  return norm(A.Ecliptic(A.GeoVector(body, date, true)).elon);
}

export const signoDe = (lon) => SIGNOS_ORDEN[Math.floor(norm(lon) / 30)];
export const gradoEnSigno = (lon) => norm(lon) % 30;

// Velocidad aparente en grados/día (negativa = retrógrado).
function velocidad(body, date) {
  const a = longitud(body, new Date(date.getTime() - DIA / 2));
  const b = longitud(body, new Date(date.getTime() + DIA / 2));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export function posiciones(date) {
  return PLANETAS.map((body) => {
    const lon = longitud(body, date);
    const v = body === 'Sun' || body === 'Moon' ? 1 : velocidad(body, date);
    return { body, lon, signo: signoDe(lon), grado: gradoEnSigno(lon), retro: v < 0 };
  });
}

const FASES = [
  { max: 22.5, id: 'nueva', nombre: 'Luna nueva', emoji: '🌑' },
  { max: 67.5, id: 'creciente-iluminante', nombre: 'Luna creciente', emoji: '🌒' },
  { max: 112.5, id: 'cuarto-creciente', nombre: 'Cuarto creciente', emoji: '🌓' },
  { max: 157.5, id: 'gibosa-creciente', nombre: 'Gibosa creciente', emoji: '🌔' },
  { max: 202.5, id: 'llena', nombre: 'Luna llena', emoji: '🌕' },
  { max: 247.5, id: 'gibosa-menguante', nombre: 'Gibosa menguante', emoji: '🌖' },
  { max: 292.5, id: 'cuarto-menguante', nombre: 'Cuarto menguante', emoji: '🌗' },
  { max: 337.5, id: 'menguante', nombre: 'Luna menguante', emoji: '🌘' },
  { max: 360.1, id: 'nueva', nombre: 'Luna nueva', emoji: '🌑' },
];

export function luna(date) {
  const angulo = A.MoonPhase(date);
  const fase = FASES.find((f) => angulo < f.max);
  const ilum = A.Illumination('Moon', date).phase_fraction;
  const lon = longitud('Moon', date);
  // Momento en que la Luna cambia de signo.
  const limite = (Math.floor(lon / 30) + 1) * 30;
  let t = date.getTime();
  while (Math.floor(longitud('Moon', new Date(t)) / 30) === Math.floor(lon / 30)) t += 3600000;
  const cambio = refinar((d) => norm(longitud('Moon', d) - limite + 180) - 180, new Date(t - 3600000), new Date(t));
  return {
    angulo, fase, iluminacion: ilum, signo: signoDe(lon), grado: gradoEnSigno(lon),
    proximoSigno: signoDe(limite + 1), cambioSigno: cambio,
  };
}

// Bisección para encontrar el cruce por cero de f entre a y b.
function refinar(f, a, b) {
  let fa = f(a);
  for (let i = 0; i < 30; i++) {
    const m = new Date((a.getTime() + b.getTime()) / 2);
    const fm = f(m);
    if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else { b = m; }
  }
  return new Date((a.getTime() + b.getTime()) / 2);
}

const CUARTOS = ['Luna nueva', 'Cuarto creciente', 'Luna llena', 'Cuarto menguante'];
const CUARTOS_ID = ['nueva', 'cuarto-creciente', 'llena', 'cuarto-menguante'];

export function proximasFasesLunares(desde, cantidad = 8) {
  const out = [];
  let q = A.SearchMoonQuarter(desde);
  for (let i = 0; i < cantidad; i++) {
    const fecha = q.time.date;
    out.push({ fecha, nombre: CUARTOS[q.quarter], id: CUARTOS_ID[q.quarter], signo: signoDe(longitud('Moon', fecha)) });
    q = A.NextMoonQuarter(q);
  }
  return out;
}

const TIPO_ECLIPSE = { total: 'total', partial: 'parcial', annular: 'anular', penumbral: 'penumbral', hybrid: 'híbrido' };

export function proximosEclipses(desde, hasta) {
  const out = [];
  let l = A.SearchLunarEclipse(desde);
  while (l.peak.date < hasta) {
    out.push({ fecha: l.peak.date, tipo: 'lunar', detalle: TIPO_ECLIPSE[l.kind] || l.kind, signo: signoDe(longitud('Moon', l.peak.date)) });
    l = A.NextLunarEclipse(l.peak);
  }
  let s = A.SearchGlobalSolarEclipse(desde);
  while (s.peak.date < hasta) {
    out.push({ fecha: s.peak.date, tipo: 'solar', detalle: TIPO_ECLIPSE[s.kind] || s.kind, signo: signoDe(longitud('Sun', s.peak.date)) });
    s = A.NextGlobalSolarEclipse(s.peak);
  }
  return out.sort((a, b) => a.fecha - b.fecha);
}

// Estaciones (inicio y fin de retrogradación) e ingresos de signo en un período.
export function eventosPlanetarios(desde, hasta) {
  const out = [];
  for (const body of RETROGRADABLES) {
    let prevT = desde;
    let prevV = velocidad(body, desde);
    let prevS = Math.floor(longitud(body, desde) / 30);
    for (let t = desde.getTime() + DIA; t <= hasta.getTime(); t += DIA) {
      const d = new Date(t);
      const v = velocidad(body, d);
      if (Math.sign(v) !== Math.sign(prevV)) {
        const fecha = refinar((x) => velocidad(body, x), prevT, d);
        out.push({ fecha, body, tipo: v < 0 ? 'retro' : 'directo', signo: signoDe(longitud(body, fecha)) });
      }
      const s = Math.floor(longitud(body, d) / 30);
      if (s !== prevS && ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(body)) {
        const limite = (v >= 0 ? s : prevS) * 30;
        const fecha = refinar((x) => norm(longitud(body, x) - limite + 180) - 180, prevT, d);
        out.push({ fecha, body, tipo: 'ingreso', signo: SIGNOS_ORDEN[s] });
      }
      prevT = d; prevV = v; prevS = s;
    }
  }
  // Ingresos del Sol: comienzo de cada temporada zodiacal.
  for (let k = 0; k < 12; k++) {
    let t = A.SearchSunLongitude(k * 30, desde, 370);
    if (t && t.date < hasta) out.push({ fecha: t.date, body: 'Sun', tipo: 'ingreso', signo: SIGNOS_ORDEN[k] });
  }
  return out.sort((a, b) => a.fecha - b.fecha);
}

// Casa solar: posición de un signo contado desde el signo del lector (1 = mismo signo).
export const casaSolar = (signoLector, signoTransito) =>
  ((SIGNOS_ORDEN.indexOf(signoTransito) - SIGNOS_ORDEN.indexOf(signoLector) + 12) % 12) + 1;

export function cieloDelDia(date) {
  return { fecha: date, posiciones: posiciones(date), luna: luna(date) };
}

// Temporada real de cada signo: cuándo entra y sale el Sol. Para cada signo se toma
// la temporada en curso o, si ya pasó, la próxima.
export function temporadas(fecha) {
  const desde = new Date(fecha.getTime() - 31 * DIA);
  return Object.fromEntries(SIGNOS_ORDEN.map((id, k) => {
    const inicio = A.SearchSunLongitude(k * 30, desde, 400).date;
    const fin = A.SearchSunLongitude(((k + 1) % 12) * 30, inicio, 40).date;
    return [id, { inicio, fin }];
  }));
}
