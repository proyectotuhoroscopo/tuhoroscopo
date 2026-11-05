// Reescritura diaria de los textos con una IA de plan gratuito.
// La IA recibe el horóscopo armado por reglas y los datos reales del cielo, y devuelve una
// versión redactada de forma más natural y variada. Si no hay clave, falla o responde mal,
// el sitio usa los textos por reglas: nunca se queda sin contenido.
//
// Variables de entorno (en .env o en los secrets de GitHub):
//   IA_API_KEY   clave de la API (Google AI Studio es gratis)
//   IA_BASE_URL  endpoint compatible con OpenAI (por defecto, el de Gemini)
//   IA_MODELO    opcional; si falta, se elige el mejor modelo "flash" disponible
import fs from 'node:fs';
import path from 'node:path';
import { SIGNOS_ORDEN } from './astro.mjs';
import { SIGNOS, PLANETA_NOMBRE, CASA_TEMA } from './data/signos.mjs';

const BASE_URL = (process.env.IA_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai').replace(/\/$/, '');
const CAMPOS = { titular: [3, 60], general: [80, 750], amor: [40, 450], dinero: [40, 450], salud: [30, 400], consejo: [5, 120] };
const FRASE = [20, 160];

const INSTRUCCIONES = `Eres el redactor de un sitio de horóscopo diario en español para toda Latinoamérica.
Recibes, para cada signo, un borrador escrito por reglas y los datos astronómicos reales del día.
Reescribe cada texto con tus palabras para que suene natural, cálido y distinto entre signos.

Reglas:
- Español neutro, tratando al lector de "tú". Sin regionalismos.
- Respeta el sentido del borrador y los datos del cielo. No inventes posiciones de planetas, retrógrados ni fases que no estén en los datos.
- Puedes mencionar los planetas y casas que aparecen en los datos, sin tecnicismos excesivos.
- Tono constructivo: nada catastrófico, sin promesas de dinero, sin consejos médicos ni financieros concretos.
- No uses emojis, HTML, enlaces ni comillas tipográficas raras.
- Largos: titular de 2 a 6 palabras; general de 2 a 4 oraciones; amor, dinero y salud de 1 a 3 oraciones; consejo de una frase corta.

Además escribe las 12 "frases del día" de la carta natal: una por casa, para las personas a las que hoy la Luna
les pasa por esa casa (el tema de cada casa viene en "casas"). Cada frase es UNA oración corta, inspiradora y
concreta, que se pueda leer como la frase del día de esa persona. Que no se parezcan entre sí ni a frases hechas.

Responde SOLO con un objeto JSON con esta forma exacta:
{"signos": {"aries": {"titular": "...", "general": "...", "amor": "...", "dinero": "...", "salud": "...", "consejo": "..."}, "...": {}},
 "frases": {"1": "...", "2": "...", ..., "12": "..."}}
Debe incluir los 12 signos: ${SIGNOS_ORDEN.join(', ')}.`;

// Pedido aparte para los días que ya tenían horóscopos guardados pero todavía no tenían frases.
const INSTRUCCIONES_FRASES = `Eres el redactor de un sitio de horóscopo en español neutro para toda Latinoamérica, tratando al lector de "tú".
Escribe las 12 "frases del día" de la carta natal: una por casa, para las personas a las que hoy la Luna les pasa
por esa casa (el tema de cada casa viene en "casas"). Cada frase es UNA oración corta, inspiradora y concreta.
Que no se parezcan entre sí ni a frases hechas. Sin emojis, HTML ni enlaces.
Responde SOLO con un objeto JSON: {"frases": {"1": "...", "2": "...", ..., "12": "..."}}`;

function pedido(fechaLarga, cielo, horoscopos) {
  const pos = Object.fromEntries(cielo.posiciones.map((p) => [p.body, p]));
  return JSON.stringify({
    fecha: fechaLarga,
    casas: CASA_TEMA,
    cielo: {
      luna: `${cielo.luna.fase.nombre} en ${SIGNOS[cielo.luna.signo].nombre}, ${Math.round(cielo.luna.iluminacion * 100)}% iluminada`,
      planetas: cielo.posiciones.map((p) => `${PLANETA_NOMBRE[p.body]} en ${SIGNOS[p.signo].nombre}${p.retro ? ' (retrógrado)' : ''}`),
    },
    signos: Object.fromEntries(SIGNOS_ORDEN.map((id) => {
      const h = horoscopos[id];
      return [id, {
        signo: SIGNOS[id].nombre,
        datos: [
          `Luna en ${SIGNOS[pos.Moon.signo].nombre}, casa ${h.claves.lunaCasa} de ${SIGNOS[id].nombre} (${CASA_TEMA[h.claves.lunaCasa]})`,
          `Venus en casa ${h.claves.venusCasa} (${CASA_TEMA[h.claves.venusCasa]})`,
          `Marte en casa ${h.claves.marteCasa} (${CASA_TEMA[h.claves.marteCasa]})`,
        ],
        tono: `amor ${h.puntajes.amor}/5, dinero ${h.puntajes.dinero}/5, salud ${h.puntajes.salud}/5`,
        borrador: { titular: h.titular, general: h.general, amor: h.amor, dinero: h.dinero, salud: h.salud, consejo: h.consejo },
      }];
    })),
  });
}

export function validarFrases(obj) {
  const f = obj?.frases;
  if (!f || typeof f !== 'object') return 'falta "frases"';
  for (let c = 1; c <= 12; c++) {
    const v = f[c];
    if (typeof v !== 'string') return `frase ${c} no es texto`;
    const t = v.trim();
    if (t.length < FRASE[0] || t.length > FRASE[1]) return `frase ${c} tiene ${t.length} caracteres`;
    if (/[<>]|https?:/i.test(t)) return `frase ${c} tiene HTML o enlaces`;
  }
  return null;
}

// Revisa que la respuesta tenga los 12 signos con todos los campos y largos razonables.
export function validar(obj) {
  const signos = obj?.signos;
  if (!signos || typeof signos !== 'object') return 'falta "signos"';
  for (const id of SIGNOS_ORDEN) {
    const s = signos[id];
    if (!s) return `falta el signo ${id}`;
    for (const [campo, [min, max]] of Object.entries(CAMPOS)) {
      const v = s[campo];
      if (typeof v !== 'string') return `${id}.${campo} no es texto`;
      const t = v.trim();
      if (t.length < min || t.length > max) return `${id}.${campo} tiene ${t.length} caracteres`;
      if (/[<>]|https?:/i.test(t)) return `${id}.${campo} tiene HTML o enlaces`;
    }
  }
  return null;
}

function extraerJSON(texto) {
  const limpio = texto.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '');
  const i = limpio.indexOf('{'), j = limpio.lastIndexOf('}');
  return JSON.parse(limpio.slice(i, j + 1));
}

async function llamar(url, opciones, timeoutMs = 120000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...opciones, signal: ctrl.signal });
    const cuerpo = await r.text();
    if (!r.ok) {
      const msg = (cuerpo.match(/"message":\s*"([^"]+)"/) || [0, cuerpo.slice(0, 160)])[1];
      throw Object.assign(new Error(`HTTP ${r.status}: ${msg}`), { status: r.status });
    }
    return JSON.parse(cuerpo);
  } finally {
    clearTimeout(t);
  }
}

let candidatos;
// Lista de modelos a probar, en orden. Si uno está saturado o falla, se pasa al siguiente.
async function modelos(key) {
  if (process.env.IA_MODELO) return [process.env.IA_MODELO];
  if (candidatos) return candidatos;
  const r = await llamar(`${BASE_URL}/models`, { headers: { Authorization: `Bearer ${key}` } });
  const ids = (r.data || []).map((m) => String(m.id).replace(/^models\//, ''));
  const texto = ids.filter((id) => /flash/i.test(id) && !/image|tts|audio|live|embedding|vision|omni/i.test(id));
  const version = (id) => parseFloat((id.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1]);
  // Primero los "flash" completos de versión más alta y estables; los "lite" y "preview" quedan de respaldo.
  texto.sort((a, b) => /lite/.test(a) - /lite/.test(b) || /preview|exp/.test(a) - /preview|exp/.test(b) || version(b) - version(a));
  if (!texto.length) throw new Error(`no hay modelos "flash" disponibles (${ids.slice(0, 8).join(', ')})`);
  candidatos = texto.slice(0, 10);
  return candidatos;
}

// Pide a la IA un JSON y lo valida. Si un modelo está saturado o falla, prueba el siguiente.
// Devuelve { modelo, obj } o null si no hay clave o ninguno respondió bien.
async function pedirJSON(instrucciones, contenido, validarFn, etiqueta) {
  const key = process.env.IA_API_KEY;
  if (!key) return null;
  let lista = [];
  try { lista = await modelos(key); } catch (e) { console.warn(`IA: no se pudo obtener la lista de modelos (${e.message})`); }
  for (const m of lista) {
    try {
      const r = await llamar(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: m,
          temperature: 0.9,
          response_format: { type: 'json_object' },
          messages: [{ role: 'system', content: instrucciones }, { role: 'user', content: contenido }],
        }),
      });
      const obj = extraerJSON(r.choices?.[0]?.message?.content || '');
      const error = validarFn(obj);
      if (error) throw new Error(`respuesta inválida: ${error}`);
      console.log(`IA: textos de ${etiqueta} generados con ${m}`);
      candidatos = [m, ...(candidatos || []).filter((x) => x !== m)]; // el que anduvo se usa primero para el próximo pedido
      return { modelo: m, obj };
    } catch (e) {
      console.warn(`IA: ${m} falló para ${etiqueta} (${e.message})`);
      if (e.status === 401 || e.status === 403) return null; // clave inválida: no tiene sentido seguir
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  return null;
}

/**
 * Devuelve los horóscopos reescritos por la IA, o los originales si no se puede.
 * Guarda el resultado en data/ia/<fecha>.json para no volver a pedirlo (así el
 * horóscopo de "mañana" que se publica hoy es el mismo que se ve mañana como "hoy").
 */
export async function reescribir({ clave, fechaLarga, cielo, horoscopos, carpeta }) {
  const archivo = path.join(carpeta, `${clave}.json`);
  let datos = null;

  if (fs.existsSync(archivo)) {
    try {
      const guardado = JSON.parse(fs.readFileSync(archivo, 'utf8'));
      if (!validar(guardado)) datos = guardado;
    } catch { /* archivo dañado: se vuelve a pedir */ }
  }

  const key = process.env.IA_API_KEY;
  if (!datos && key) {
    const r = await pedirJSON(INSTRUCCIONES, pedido(fechaLarga, cielo, horoscopos), validar, clave);
    if (r) {
      datos = { modelo: r.modelo, generado: new Date().toISOString(), signos: r.obj.signos };
      if (!validarFrases(r.obj)) datos.frases = r.obj.frases;
      fs.mkdirSync(carpeta, { recursive: true });
      fs.writeFileSync(archivo, JSON.stringify(datos, null, 1));
    }
  }
  // Si el día ya tenía horóscopos pero le faltan las frases (o salieron mal), se piden aparte.
  if (datos && validarFrases(datos) && key) {
    const contenido = JSON.stringify({ fecha: fechaLarga, casas: CASA_TEMA, luna: `${cielo.luna.fase.nombre} en ${SIGNOS[cielo.luna.signo].nombre}` });
    const r = await pedirJSON(INSTRUCCIONES_FRASES, contenido, validarFrases, `frases ${clave}`);
    if (r) {
      datos.frases = r.obj.frases;
      fs.writeFileSync(archivo, JSON.stringify(datos, null, 1));
    }
  }
  const frases = datos && !validarFrases(datos)
    ? Object.fromEntries(Object.entries(datos.frases).map(([c, t]) => [c, t.trim()])) : null;

  if (!datos) {
    console.log(`IA: ${clave} usa los textos por reglas${key ? '' : ' (no hay IA_API_KEY)'}`);
    return { horoscopos, fuente: 'reglas', frases };
  }
  const salida = {};
  for (const id of SIGNOS_ORDEN) {
    const s = datos.signos[id];
    salida[id] = { ...horoscopos[id], ...Object.fromEntries(Object.keys(CAMPOS).map((c) => [c, s[c].trim()])) };
  }
  return { horoscopos: salida, fuente: 'ia', frases };
}

// ---------- Compatibilidad ----------
// El detalle de cada pareja no cambia con los días: se pide una sola vez y queda guardado
// en data/ia/compatibilidad.json. Si falta alguna pareja, se completa en la próxima publicación.
const CAMPOS_COMPAT = { amor: [80, 650], amistad: [80, 650], trabajo: [80, 650], consejo: [5, 140] };
const POR_PEDIDO = 13;

const INSTRUCCIONES_COMPAT = `Eres el redactor de un sitio de horóscopo en español para toda Latinoamérica.
Para cada pareja de signos recibes un borrador con su compatibilidad en el amor, la amistad y el trabajo,
y los datos astrológicos de la pareja (aspecto, elementos y modalidades).
Reescribe cada área con tus palabras, de forma concreta y específica para ESA pareja: menciona rasgos de los
dos signos, situaciones cotidianas en que se nota la combinación y qué les conviene hacer.

Reglas:
- Español neutro, tratando al lector de "tú" cuando le hables. Sin regionalismos.
- Respeta el sentido del borrador y el porcentaje de cada área (más alto = más armonía).
- Tono constructivo y entretenido, nunca determinista ni catastrófico.
- Sin emojis, HTML ni enlaces.
- Largos: amor, amistad y trabajo de 3 a 4 oraciones cada uno; consejo de una frase corta.

Responde SOLO con un objeto JSON con esta forma exacta:
{"parejas": {"aries-tauro": {"amor": "...", "amistad": "...", "trabajo": "...", "consejo": "..."}, "...": {}}}
Usa exactamente las claves de pareja que recibes.`;

const validarCompat = (claves) => (obj) => {
  const p = obj?.parejas;
  if (!p || typeof p !== 'object') return 'falta "parejas"';
  for (const k of claves) {
    if (!p[k]) return `falta la pareja ${k}`;
    for (const [campo, [min, max]] of Object.entries(CAMPOS_COMPAT)) {
      const v = p[k][campo];
      if (typeof v !== 'string') return `${k}.${campo} no es texto`;
      const t = v.trim();
      if (t.length < min || t.length > max) return `${k}.${campo} tiene ${t.length} caracteres`;
      if (/[<>]|https?:/i.test(t)) return `${k}.${campo} tiene HTML o enlaces`;
    }
  }
  return null;
};

/**
 * parejas: { "aries-tauro": { a, b, compat } }, donde compat es el resultado de compatibilidad(a, b).
 * Devuelve { clave: { amor, amistad, trabajo, consejo } } con las parejas que ya tienen texto de IA.
 */
export async function compatibilidadesIA({ parejas, carpeta }) {
  const archivo = path.join(carpeta, 'compatibilidad.json');
  let guardado = {};
  try { guardado = JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch { /* todavía no existe */ }
  const validas = Object.fromEntries(Object.entries(guardado).filter(([k, v]) => parejas[k] && !validarCompat([k])({ parejas: { [k]: v } })));
  const faltan = Object.keys(parejas).filter((k) => !validas[k]);

  if (faltan.length && process.env.IA_API_KEY) {
    for (let i = 0; i < faltan.length; i += POR_PEDIDO) {
      const claves = faltan.slice(i, i + POR_PEDIDO);
      const contenido = JSON.stringify({
        parejas: Object.fromEntries(claves.map((k) => {
          const { a, b, compat: c } = parejas[k];
          return [k, {
            signos: `${SIGNOS[a].nombre} y ${SIGNOS[b].nombre}`,
            datos: `${c.aspecto}; ${SIGNOS[a].elemento} y ${SIGNOS[b].elemento}; ${SIGNOS[a].modalidad} y ${SIGNOS[b].modalidad}`,
            porcentajes: `amor ${c.amor}%, amistad ${c.amistad}%, trabajo ${c.trabajo}%`,
            borrador: c.detalle,
          }];
        })),
      });
      const r = await pedirJSON(INSTRUCCIONES_COMPAT, contenido, validarCompat(claves), `compatibilidad ${i / POR_PEDIDO + 1}`);
      if (!r) break; // si la IA no responde, se reintenta en la próxima publicación
      for (const k of claves) {
        const v = r.obj.parejas[k];
        validas[k] = Object.fromEntries(Object.keys(CAMPOS_COMPAT).map((c) => [c, v[c].trim()]));
        validas[k].modelo = r.modelo;
      }
      fs.mkdirSync(carpeta, { recursive: true });
      fs.writeFileSync(archivo, JSON.stringify(validas, null, 1));
    }
  }
  const faltantes = Object.keys(parejas).length - Object.keys(validas).length;
  console.log(`IA: compatibilidad con texto de IA en ${Object.keys(validas).length} parejas${faltantes ? ` (faltan ${faltantes}, usan textos por reglas)` : ''}`);
  return validas;
}
