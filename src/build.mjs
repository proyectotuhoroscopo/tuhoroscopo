// Genera el sitio completo en dist/. Uso:
//   node src/build.mjs                    → sitio normal para producción
//   node src/build.mjs --fecha=2026-11-20 → simula otro día
//   node src/build.mjs --artifact         → versión para la demo publicada (CSS en línea)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import CONFIG from '../config.mjs';
import { SIGNOS_ORDEN, temporadas, cieloDelDia, proximasFasesLunares, proximosEclipses, eventosPlanetarios } from './astro.mjs';
import { horoscopoDelDia } from './textgen.mjs';
import { compatibilidad } from './textgen.mjs';
import { reescribir, compatibilidadesIA } from './ia.mjs';
import * as P from './render/pages.mjs';
import { paginaTarot, paginaCarta, cartaDelDia } from './render/lenormand.mjs';
import { paginaCartaNatal } from './render/carta-natal.mjs';
import { CARTAS } from './data/lenormand.mjs';

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
try { process.loadEnvFile(path.join(RAIZ, '.env')); } catch { /* sin .env: se usan las variables del sistema */ }
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const SALIDA = path.join(RAIZ, args.out || 'dist');
const DIA = 864e5;

// Fecha "de hoy" en la zona horaria del sitio.
const claveLocal = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
function mediodiaLocal(clave) {
  const [y, m, d] = clave.split('-').map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, 12));
  const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: CONFIG.zonaHoraria, hour: '2-digit', hour12: false }).format(guess));
  return new Date(guess.getTime() - (h - 12) * 3600000);
}

const ahora = args.fecha ? mediodiaLocal(args.fecha) : new Date();
const clave = claveLocal(ahora);
const mediodia = mediodiaLocal(clave);
const claveManana = claveLocal(new Date(mediodia.getTime() + DIA));
const mediodiaManana = mediodiaLocal(claveManana);
const hasta = new Date(mediodia.getTime() + 366 * DIA);

const cielo = cieloDelDia(mediodia);
const cieloManana = cieloDelDia(mediodiaManana);
const largo = (d) => { const s = P.fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); return s[0].toUpperCase() + s.slice(1); };
const corto = (d) => P.fmt(d, { day: 'numeric', month: 'long' });

const ctx = {
  ahora, hasta, cielo, cieloManana,
  temporadas: temporadas(mediodia),
  fechaISO: clave,
  fechaLarga: largo(mediodia), fechaCorta: corto(mediodia),
  fechaLargaManana: largo(mediodiaManana), fechaCortaManana: corto(mediodiaManana),
  actualizado: P.fmt(new Date(), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
  horoscopos: Object.fromEntries(SIGNOS_ORDEN.map((s) => [s, horoscopoDelDia(s, cielo, clave)])),
  horoscoposManana: Object.fromEntries(SIGNOS_ORDEN.map((s) => [s, horoscopoDelDia(s, cieloManana, claveManana)])),
  fases: proximasFasesLunares(new Date(mediodia.getTime() - DIA), 60).filter((f) => f.fecha < hasta),
  eclipses: proximosEclipses(mediodia, new Date(mediodia.getTime() + 2 * 366 * DIA)),
  eventos: eventosPlanetarios(mediodia, hasta),
};
// Reescritura con IA (si hay clave). Se guarda en data/ia/ para no pedir dos veces el mismo día.
const carpetaIA = path.join(RAIZ, 'data/ia');
const hoyIA = await reescribir({ clave, fechaLarga: ctx.fechaLarga, cielo, horoscopos: ctx.horoscopos, carpeta: carpetaIA });
const mananaIA = await reescribir({ clave: claveManana, fechaLarga: ctx.fechaLargaManana, cielo: cieloManana, horoscopos: ctx.horoscoposManana, carpeta: carpetaIA });
ctx.horoscopos = hoyIA.horoscopos;
ctx.horoscoposManana = mananaIA.horoscopos;
ctx.compatIA = await compatibilidadesIA({
  parejas: Object.fromEntries(P.pares().map(([a, b]) => [P.pairSlug(a, b), { a, b, compat: compatibilidad(a, b) }])),
  carpeta: carpetaIA,
});
ctx.cartaDelDia = cartaDelDia(clave);
// Frases del día de la carta natal escritas por la IA, por fecha (la página elige la del día del visitante).
ctx.frases = Object.fromEntries([[clave, hoyIA.frases], [claveManana, mananaIA.frases]].filter(([, f]) => f));

// La tabla de próximas fases empieza en la siguiente, no en la de ayer.
ctx.fases = ctx.fases.filter((f) => f.fecha >= ahora);

const modoArtifact = Boolean(args.artifact);
const css = fs.readFileSync(path.join(RAIZ, 'public/styles.css'), 'utf8');
const extra = modoArtifact ? { css } : {};

fs.rmSync(SALIDA, { recursive: true, force: true });
const archivos = [];
function escribir(ruta, html) {
  const destino = path.join(SALIDA, ruta);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  archivos.push(ruta);
}

// En modo artifact cada página lleva el CSS en línea; la portada va sin esqueleto HTML.
const conCss = (html) => (modoArtifact ? html.replace(/<link rel="stylesheet" href="(\.\.\/)?styles\.css">/, `<style>${css}</style>`) : html);

escribir('index.html', P.portada(ctx, { ...extra, fragmento: modoArtifact }));
for (const id of SIGNOS_ORDEN) {
  escribir(`horoscopo/${id}.html`, conCss(P.paginaSigno(ctx, id)));
  escribir(`horoscopo/${id}-manana.html`, conCss(P.paginaSigno(ctx, id, { manana: true })));
}
escribir('luna-hoy.html', conCss(P.paginaLuna(ctx)));
escribir('calendario-astral.html', conCss(P.paginaCalendario(ctx)));
escribir('compatibilidad.html', conCss(P.paginaCompatibilidadIndice(ctx)));
for (const [a, b] of P.pares()) escribir(`compatibilidad/${a}-${b}.html`, conCss(P.paginaPareja(ctx, a, b)));
escribir('carta-natal.html', conCss(paginaCartaNatal(ctx)));
escribir('tarot-lenormand.html', conCss(paginaTarot(ctx)));
for (const c of CARTAS) escribir(`lenormand/${c.id}.html`, conCss(paginaCarta(ctx, c)));

// Módulos que corren en el navegador (carta natal y tirada de cartas): se copian con la misma
// estructura de carpetas para que sus imports relativos funcionen igual que en Node.
const MODULOS = ['config.mjs', 'src/astro.mjs', 'src/natal.mjs', 'src/data/signos.mjs', 'src/data/natal.mjs', 'src/data/ciudades.mjs',
  'src/data/lenormand.mjs', 'src/render/layout.mjs', 'src/render/svg.mjs', 'src/render/lenormand.mjs', 'src/cliente/carta.mjs', 'src/cliente/lenormand.mjs'];
for (const m of MODULOS) {
  fs.mkdirSync(path.dirname(path.join(SALIDA, 'js', m)), { recursive: true });
  fs.copyFileSync(path.join(RAIZ, m), path.join(SALIDA, 'js', m));
  archivos.push(`js/${m}`);
}
fs.copyFileSync(path.join(RAIZ, 'node_modules/astronomy-engine/esm/astronomy.js'), path.join(SALIDA, 'js/astronomy.mjs'));
archivos.push('js/astronomy.mjs');

// Archivos estáticos, sitemap y robots.
for (const f of fs.readdirSync(path.join(RAIZ, 'public'))) {
  if (modoArtifact && f === 'styles.css') continue;
  fs.cpSync(path.join(RAIZ, 'public', f), path.join(SALIDA, f), { recursive: true });
  archivos.push(f);
}
const urls = archivos.filter((f) => f.endsWith('.html'))
  .map((f) => `  <url><loc>${CONFIG.url}/${f.replace(/index\.html$/, '').replace(/\.html$/, '')}</loc><lastmod>${clave}</lastmod></url>`);
fs.writeFileSync(path.join(SALIDA, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(SALIDA, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${CONFIG.url}/sitemap.xml\n`);

console.log(`Sitio generado para ${ctx.fechaLarga}: ${archivos.length} archivos en ${path.relative(RAIZ, SALIDA)}/ (textos: hoy ${hoyIA.fuente}, mañana ${mananaIA.fuente})`);
