// Carta natal y frase del día personalizada. Corre en el navegador (carta-natal.html) y en Node (pruebas).
import * as A from 'astronomy-engine';
import { posiciones, longitud, signoDe, gradoEnSigno, SIGNOS_ORDEN } from './astro.mjs';
import { FRASE_CASA, ASPECTO_SOL } from './data/natal.mjs';

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const norm = (x) => ((x % 360) + 360) % 360;

// Diferencia en minutos entre la hora local de una zona y UTC en un instante dado (con horario de verano histórico).
function desfase(fechaUTC, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(fechaUTC).map((x) => [x.type, x.value]));
  const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return (local - Math.floor(fechaUTC.getTime() / 60000) * 60000) / 60000;
}

// Convierte una fecha y hora del reloj local de la ciudad de nacimiento al instante UTC.
export function utcDesdeLocal(y, m, d, h, mi, tz) {
  const pared = Date.UTC(y, m - 1, d, h, mi);
  let t = pared - desfase(new Date(pared), tz) * 60000;
  t = pared - desfase(new Date(t), tz) * 60000; // segunda pasada por si cae cerca de un cambio de hora
  return new Date(t);
}

// Oblicuidad media de la eclíptica (Laskar, suficiente para el Ascendente).
const oblicuidad = (fecha) => {
  const T = (fecha.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 864e5);
  return 23.4392911 - 0.0130042 * T;
};

// Ascendente y Medio Cielo en longitud eclíptica.
export function angulos(fecha, lat, lon) {
  const ramc = rad(norm(A.SiderealTime(fecha) * 15 + lon));
  const e = rad(oblicuidad(fecha));
  const asc = norm(deg(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(e) + Math.tan(rad(lat)) * Math.sin(e)))));
  const mc = norm(deg(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(e))));
  return { asc, mc };
}

/**
 * fecha: instante UTC del nacimiento. lat/lon: lugar. conHora: si se conoce la hora exacta.
 * Sin hora no hay Ascendente ni casas, y se avisa si la Luna cambió de signo ese día.
 */
export function cartaNatal({ fecha, lat, lon, conHora = true }) {
  const pos = posiciones(fecha);
  const carta = { fecha, conHora, posiciones: pos };
  const sig = (body) => pos.find((p) => p.body === body);
  carta.sol = sig('Sun'); carta.luna = sig('Moon');
  if (conHora) {
    const { asc, mc } = angulos(fecha, lat, lon);
    carta.asc = { lon: asc, signo: signoDe(asc), grado: gradoEnSigno(asc) };
    carta.mc = { lon: mc, signo: signoDe(mc), grado: gradoEnSigno(mc) };
    // Casas por signo entero: la casa 1 es el signo del Ascendente.
    const i0 = SIGNOS_ORDEN.indexOf(carta.asc.signo);
    for (const p of pos) p.casa = ((SIGNOS_ORDEN.indexOf(p.signo) - i0 + 12) % 12) + 1;
  } else {
    const ini = signoDe(longitud('Moon', new Date(fecha.getTime() - 12 * 36e5)));
    const fin = signoDe(longitud('Moon', new Date(fecha.getTime() + 12 * 36e5)));
    carta.lunaDudosa = ini !== fin ? [ini, fin] : null;
  }
  return carta;
}

function semilla(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967296;
}

const ASPECTOS = [[0, 'conjuncion'], [60, 'sextil'], [90, 'cuadratura'], [120, 'trigono'], [180, 'oposicion']];

/**
 * Frase para el día `hoy` según por dónde pasa la Luna en tu carta.
 * Con hora: casa desde el Ascendente. Sin hora: casa solar (desde el signo del Sol).
 * frasesDia: las 12 frases que escribió la IA para ese día; si faltan, se usa el banco fijo.
 */
export function fraseDelDia(carta, hoy, claveDia, frasesDia = null) {
  const lunaHoy = longitud('Moon', hoy);
  const signoLuna = signoDe(lunaHoy);
  const desde = carta.asc ? carta.asc.signo : carta.sol.signo;
  const casa = ((SIGNOS_ORDEN.indexOf(signoLuna) - SIGNOS_ORDEN.indexOf(desde) + 12) % 12) + 1;
  const opciones = FRASE_CASA[casa];
  const frase = frasesDia?.[casa] || opciones[Math.floor(semilla(`${claveDia}:${carta.fecha.getTime()}`) * opciones.length)];
  const sep = Math.abs(((lunaHoy - carta.sol.lon + 540) % 360) - 180);
  const asp = ASPECTOS.find(([ang]) => Math.abs(sep - ang) <= 8);
  return { frase, casa, signoLuna, desdeAsc: Boolean(carta.asc), aspecto: asp ? ASPECTO_SOL[asp[1]] : null };
}
