// Genera el horóscopo diario y las compatibilidades a partir del cielo real.
import { casaSolar, SIGNOS_ORDEN } from './astro.mjs';
import { SIGNOS, PLANETA_NOMBRE } from './data/signos.mjs';
import * as T from './data/textos.mjs';

// PRNG determinístico: el mismo día y signo siempre dan el mismo texto.
function semilla(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const elegir = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
// Mínimo 2 estrellas: el tono del sitio es constructivo, nunca catastrófico.
const clamp = (x) => Math.max(2, Math.min(5, Math.round(x)));

const PUNTAJE_LUNA = { 1: 5, 5: 5, 9: 5, 3: 4, 11: 4, 2: 3, 10: 3, 6: 3, 7: 3, 4: 2, 8: 2, 12: 2 };
const PUNTAJE_VENUS = { 1: 5, 5: 5, 7: 5, 11: 4, 9: 4, 3: 4, 2: 3, 10: 3, 4: 3, 6: 3, 8: 3, 12: 2 };
const PUNTAJE_MARTE = { 10: 5, 1: 4, 2: 4, 6: 4, 11: 4, 3: 3, 9: 3, 5: 3, 7: 3, 4: 3, 8: 3, 12: 2 };

export function horoscopoDelDia(signo, cielo, claveFecha) {
  const rnd = semilla(`${claveFecha}:${signo}`);
  const pos = Object.fromEntries(cielo.posiciones.map((p) => [p.body, p]));
  const casa = (body) => casaSolar(signo, pos[body].signo);

  const cLuna = casa('Moon');
  const cVenus = casa('Venus');
  const cMarte = casa('Mars');
  const cJupiter = casa('Jupiter');

  const general = [elegir(rnd, T.GENERAL[cLuna]), T.FASE[cielo.luna.fase.id]];
  if (T.JUPITER_BONUS[cJupiter] && ![2, 6, 10].includes(cJupiter)) general.push(T.JUPITER_BONUS[cJupiter]);
  if (pos.Sun.signo === signo) general.push(`¡Feliz temporada de ${SIGNOS[signo].nombre}! Con el Sol en tu signo, es tu momento de recargar energía y fijar metas para el año que empieza para ti.`);

  const amor = [elegir(rnd, T.AMOR[cVenus])];
  if (pos.Venus.retro) amor.push(T.RETRO.Venus);

  const dinero = [elegir(rnd, T.DINERO[cMarte])];
  if ([2, 6, 10].includes(cJupiter)) dinero.push(T.JUPITER_BONUS[cJupiter]);
  if (pos.Mercury.retro) dinero.push(T.RETRO.Mercury);
  if (pos.Mars.retro) dinero.push(T.RETRO.Mars);

  const jitter = () => (rnd() < 0.5 ? 0 : rnd() < 0.5 ? -0.5 : 0.5);
  const puntajes = {
    amor: clamp(PUNTAJE_VENUS[cVenus] - (pos.Venus.retro ? 1 : 0) + (PUNTAJE_LUNA[cLuna] - 3) * 0.4 + jitter()),
    dinero: clamp(PUNTAJE_MARTE[cMarte] + (T.JUPITER_BONUS[cJupiter] ? 0.5 : 0) - (pos.Mercury.retro ? 0.7 : 0) + jitter()),
    salud: clamp(PUNTAJE_LUNA[cLuna] - (cMarte === 6 || cMarte === 12 ? 1 : 0) + jitter()),
  };
  const promedio = (puntajes.amor + puntajes.dinero + puntajes.salud) / 3;
  const nivel = promedio >= 3.8 ? 'alta' : promedio >= 2.8 ? 'media' : 'baja';
  const nivelSalud = puntajes.salud >= 4 ? 'alta' : puntajes.salud >= 3 ? 'media' : 'baja';

  const elemLuna = SIGNOS[cielo.luna.signo].elemento;
  const afines = SIGNOS_ORDEN.filter((s) => s !== signo && SIGNOS[s].elemento === elemLuna);

  return {
    signo,
    titular: elegir(rnd, T.TITULARES[nivel]),
    general: general.join(' '),
    amor: amor.join(' '),
    dinero: dinero.join(' '),
    salud: elegir(rnd, T.SALUD[nivelSalud]),
    consejo: elegir(rnd, T.CONSEJOS),
    puntajes,
    numero: 1 + Math.floor(rnd() * 99),
    color: elegir(rnd, T.COLORES),
    compatibleHoy: elegir(rnd, afines),
    claves: { lunaCasa: cLuna, lunaSigno: cielo.luna.signo, venusCasa: cVenus, marteCasa: cMarte },
  };
}

// Frase breve para la portada.
export const resumen = (h) => h.general.split('. ')[0].replace(/\.?$/, '.');

// ---------- Compatibilidad ----------
const ASPECTO = {
  0: { nombre: 'mismo signo', texto: 'Dos personas del mismo signo se entienden sin palabras: comparten ritmos, gustos y también defectos. La clave es no competir y darse espacio.', base: 74 },
  1: { nombre: 'signos vecinos', texto: 'Son signos vecinos: muy distintos en su forma de ser, lo que genera curiosidad, pero también roces. Funcionan cuando cada uno aprende del otro.', base: 56 },
  2: { nombre: 'sextil', texto: 'Forman un sextil, una de las combinaciones más amistosas del zodíaco: hay buena comunicación, complicidad y ganas de hacer cosas juntos.', base: 84 },
  3: { nombre: 'cuadratura', texto: 'Forman una cuadratura: la atracción es fuerte, pero chocan en prioridades. Es una pareja de mucha química que necesita acuerdos claros.', base: 52 },
  4: { nombre: 'trígono', texto: 'Forman un trígono, la combinación más armoniosa: comparten elemento, se entienden naturalmente y fluyen juntos sin esfuerzo.', base: 92 },
  5: { nombre: 'quincuncio', texto: 'Forman un quincuncio: tienen poco en común a primera vista y necesitan ajustarse. Si hay interés real, se complementan de forma muy original.', base: 58 },
  6: { nombre: 'oposición', texto: 'Son signos opuestos: se atraen como imanes porque cada uno tiene lo que al otro le falta. El desafío es equilibrar sin querer cambiar al otro.', base: 72 },
};

const ELEMENTOS_PAR = {
  'fuego-fuego': 'Juntos son pura pasión y aventura, aunque cuidado con las discusiones: ninguno quiere ceder.',
  'tierra-tierra': 'Construyen una relación sólida, estable y con los pies en la tierra. Pueden caer en la rutina si no se sorprenden.',
  'aire-aire': 'La conversación nunca se agota: comparten ideas, planes y amigos. Les cuesta bajar a lo emocional.',
  'agua-agua': 'Se entienden con una mirada. La conexión emocional es profunda, aunque pueden potenciar sus inseguridades.',
  'fuego-tierra': 'El fuego aporta entusiasmo y la tierra, estabilidad. Funciona si el fuego respeta los tiempos y la tierra se anima a arriesgar.',
  'aire-fuego': 'El aire aviva al fuego: es una combinación divertida, social y llena de proyectos.',
  'agua-fuego': 'El fuego puede evaporar al agua y el agua apagar al fuego: hay pasión, pero también choques emocionales.',
  'aire-tierra': 'La tierra busca hechos y el aire, ideas. Pueden aprender mucho uno del otro si no se juzgan.',
  'agua-tierra': 'El agua nutre a la tierra: una combinación fértil, protectora y muy leal.',
  'agua-aire': 'El aire razona y el agua siente: necesitan paciencia para entender cómo vive cada uno las emociones.',
};

const MODALIDAD_PAR = {
  'cardinal-cardinal': 'Ambos quieren liderar, así que conviene repartir los roles.',
  'fijo-fijo': 'Los dos son tercos: la lealtad es enorme, pero ceder les cuesta.',
  'mutable-mutable': 'Son flexibles y adaptables, aunque a veces les falta dirección.',
  'cardinal-fijo': 'Uno inicia y el otro sostiene: si se respetan, son un gran equipo.',
  'cardinal-mutable': 'Uno propone y el otro se adapta con facilidad: la convivencia fluye.',
  'fijo-mutable': 'Uno da estabilidad y el otro aporta cambio: un buen equilibrio si no se frustran.',
};

// Detalle por área (amor, amistad, trabajo) según el aspecto entre los dos signos.
const AREA_ASPECTO = {
  0: {
    amor: 'En el amor se reconocen al instante: los mismos gustos, los mismos tiempos. El riesgo es que se potencien también los defectos y ninguno ceda.',
    amistad: 'Como amigos son espejo uno del otro. Se entienden sin explicar nada y se divierten con las mismas cosas.',
    trabajo: 'Trabajan igual, lo que agiliza todo, pero pueden tener los mismos puntos ciegos. Conviene sumar una mirada externa.',
    consejo: 'Celebren lo que comparten y respeten el espacio de cada uno.',
  },
  1: {
    amor: 'En el amor hay curiosidad y atracción por lo diferente. Cada uno tiene algo que el otro no entiende del todo, y eso puede ser un imán o una fuente de roces.',
    amistad: 'Como amigos se complementan: uno empieza donde el otro termina. Necesitan paciencia con sus distintos ritmos.',
    trabajo: 'En el trabajo funcionan si cada uno se ocupa de lo suyo. Juntos cubren más terreno del que cubriría cada uno por separado.',
    consejo: 'Aprendan del otro en lugar de querer cambiarlo.',
  },
  2: {
    amor: 'En el amor hay complicidad y buena charla. La relación crece sobre la amistad y las ganas de hacer planes juntos.',
    amistad: 'Es una de las mejores combinaciones para la amistad: se estimulan, se ríen y se apoyan.',
    trabajo: 'En el trabajo se comunican bien y se reparten las tareas con naturalidad. Ideal para proyectos creativos.',
    consejo: 'Cuiden la chispa: la comodidad no debe volverse rutina.',
  },
  3: {
    amor: 'En el amor hay mucha química y también choques. La pasión es intensa, pero necesitan acuerdos claros para no pelear por lo mismo.',
    amistad: 'Como amigos se desafían todo el tiempo. Si se respetan, se hacen crecer mutuamente.',
    trabajo: 'En el trabajo tienen prioridades distintas. Funciona si definen bien los roles y quién decide qué.',
    consejo: 'Elijan sus batallas y negocien antes de discutir.',
  },
  4: {
    amor: 'En el amor fluyen naturalmente: comparten elemento, valores y forma de sentir. Es una de las combinaciones más armoniosas.',
    amistad: 'Como amigos se entienden con una mirada. Es una amistad fácil, cálida y duradera.',
    trabajo: 'En el trabajo van en la misma dirección. El único riesgo es acomodarse y no desafiarse.',
    consejo: 'Aprovechen la armonía para animarse a cosas nuevas juntos.',
  },
  5: {
    amor: 'En el amor les cuesta entenderse al principio porque viven las cosas de forma muy distinta. Si hay interés real, se descubren de a poco.',
    amistad: 'Como amigos pueden sorprenderse: no tienen mucho en común, pero eso los saca de su zona de confort.',
    trabajo: 'En el trabajo necesitan ajustarse y explicar todo con claridad. Una vez que se entienden, se complementan muy bien.',
    consejo: 'Tengan paciencia y pregunten en lugar de suponer.',
  },
  6: {
    amor: 'En el amor se atraen como imanes: cada uno tiene lo que al otro le falta. El desafío es equilibrar sin tironear.',
    amistad: 'Como amigos se completan y se enseñan mucho, aunque a veces miran el mundo desde veredas opuestas.',
    trabajo: 'En el trabajo forman un buen equipo si valoran sus diferencias: uno ve lo que el otro no ve.',
    consejo: 'Busquen el punto medio en lugar de ganar la discusión.',
  },
};

const parKey = (a, b, orden) => [a, b].sort((x, y) => orden.indexOf(x) - orden.indexOf(y)).join('-');

export function compatibilidad(a, b) {
  // El orden no cambia el resultado: Aries y Libra es lo mismo que Libra y Aries.
  [a, b] = [a, b].sort((x, y) => SIGNOS_ORDEN.indexOf(x) - SIGNOS_ORDEN.indexOf(y));
  const ia = SIGNOS_ORDEN.indexOf(a);
  const ib = SIGNOS_ORDEN.indexOf(b);
  const d0 = Math.abs(ia - ib);
  const d = Math.min(d0, 12 - d0);
  const A = SIGNOS[a], B = SIGNOS[b];
  const asp = ASPECTO[d];
  const ek = parKey(A.elemento, B.elemento, ['fuego', 'tierra', 'aire', 'agua']);
  const mk = parKey(A.modalidad, B.modalidad, ['cardinal', 'fijo', 'mutable']);
  const elementoTexto = ELEMENTOS_PAR[ek] || ELEMENTOS_PAR[ek.split('-').reverse().join('-')];
  const rnd = semilla(`${a}-${b}`);
  const v = () => Math.round((rnd() - 0.5) * 10);
  const amor = Math.max(35, Math.min(98, asp.base + v()));
  const amistad = Math.max(35, Math.min(98, asp.base + (A.elemento === B.elemento || ek === 'aire-fuego' || ek === 'agua-tierra' ? 6 : 0) + v()));
  const trabajo = Math.max(35, Math.min(98, asp.base + (A.modalidad !== B.modalidad ? 5 : -4) + v()));
  return {
    a, b, aspecto: asp.nombre,
    texto: asp.texto, elementoTexto, modalidadTexto: MODALIDAD_PAR[mk], detalle: AREA_ASPECTO[d],
    amor, amistad, trabajo, total: Math.round((amor + amistad + trabajo) / 3),
  };
}

export const nombrePlaneta = (b) => PLANETA_NOMBRE[b];
