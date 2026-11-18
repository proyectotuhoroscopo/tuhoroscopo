// Avisa a los buscadores que usan IndexNow (Bing, Yandex, etc.) qué páginas cambiaron.
// Se corre después de publicar, leyendo el sitemap ya publicado. Uso:
//   node src/indexnow.mjs          → solo las páginas con fecha de hoy (las que cambian cada día)
//   node src/indexnow.mjs --todas  → todas las páginas del sitemap (cuando cambia el código)
import CONFIG from '../config.mjs';

if (!CONFIG.indexnow) {
  console.log('IndexNow: sin clave configurada, no se avisa.');
  process.exit(0);
}

const todas = process.argv.includes('--todas');
const r = await fetch(`${CONFIG.url}/sitemap.xml?v=${Date.now()}`);
if (!r.ok) throw new Error(`No se pudo leer el sitemap: ${r.status}`);
const xml = await r.text();
const urls = [...xml.matchAll(/<url><loc>([^<]+)<\/loc>(<lastmod>)?/g)]
  .filter(([, , conFecha]) => todas || conFecha)
  .map(([, loc]) => loc);

const host = new URL(CONFIG.url).host;
const resp = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: CONFIG.indexnow, keyLocation: `${CONFIG.url}/${CONFIG.indexnow}.txt`, urlList: urls }),
});
// 200 = recibido, 202 = recibido y la clave se está validando.
console.log(`IndexNow: ${urls.length} páginas enviadas → ${resp.status} ${resp.statusText}`);
if (resp.status >= 400) {
  console.log(await resp.text());
  process.exit(1);
}
