# Tu Horóscopo

Sitio de horóscopo diario 100% automático. Cada día calcula la posición real del Sol, la Luna y los planetas, y con ese cielo arma el horóscopo de los 12 signos. No copia contenido de otros sitios y no necesita APIs pagas ni intervención humana.

## Qué genera (147 páginas por día)

| Página | Ruta | Búsqueda que apunta a captar |
|---|---|---|
| Portada con la rueda del cielo real | `/` | "horóscopo de hoy" |
| Horóscopo de cada signo, hoy | `/horoscopo/aries` … | "horóscopo aries hoy" |
| Horóscopo de cada signo, mañana | `/horoscopo/aries-manana` … | "horóscopo aries mañana" |
| Luna hoy | `/luna-hoy` | "luna hoy", "cuándo es la luna llena" |
| Calendario astral (12 meses) | `/calendario-astral` | "mercurio retrógrado 2027", "eclipses 2027" |
| Compatibilidad: tabla + 78 parejas | `/compatibilidad/aries-libra` … | "compatibilidad aries y libra" |
| Carta natal y frase del día (se calcula en el navegador) | `/carta-natal` | "carta natal gratis", "mi ascendente" |
| Tarot Lenormand: tirada de 3 cartas y carta del día | `/tarot-lenormand` | "tarot lenormand gratis", "tirada de 3 cartas" |
| Significado de cada carta Lenormand (36) | `/lenormand/jinete` … | "significado carta el jinete lenormand" |

Además genera `sitemap.xml`, `robots.txt`, metadatos para Google y redes sociales, y espacios reservados para publicidad.

## Cómo funciona

- `src/astro.mjs`: efemérides reales (librería `astronomy-engine`): posiciones, retrógrados, fases lunares, eclipses e ingresos de signo.
- `src/textgen.mjs` y `src/data/textos.mjs`: arman el texto de cada signo según la casa solar que transita la Luna, Venus (amor), Marte (trabajo) y Júpiter, más los retrógrados del día. El mismo día da siempre el mismo texto.
- `src/ia.mjs`: si hay clave de IA, reescribe esos textos cada día para que suenen más naturales y variados. Le pasa a la IA el borrador y los datos reales del cielo, revisa la respuesta y la guarda en `data/ia/<fecha>.json`. Si no hay clave, la IA falla o responde mal, se usan los textos por reglas.
- `src/natal.mjs`: carta natal (Ascendente, Medio Cielo, casas por signo entero) y frase del día. Corre en el navegador: los datos de nacimiento quedan solo en el dispositivo de la persona.
- `src/cliente/`: código que corre en el navegador (carta natal y tirada de cartas). El build lo copia a `dist/js/` con la misma estructura de carpetas, junto con la librería astronómica.
- La IA también escribe una vez el detalle de las 78 parejas de compatibilidad (`data/ia/compatibilidad.json`).
- `src/render/`: plantillas HTML. `public/styles.css`: diseño.
- `config.mjs`: nombre, dominio, zona horaria y AdSense. Para clonar el sitio a otro país se cambia acá.

## Comandos

```bash
npm install
npm run build                          # genera dist/
npm run dev                            # genera y sirve en http://localhost:4321
node src/build.mjs --fecha=2026-12-24  # simula otro día
```

## IA para los textos (gratis)

1. Crear una clave gratuita en Google AI Studio (https://aistudio.google.com/apikey). No pide tarjeta.
2. Para probar en la compu, crear un archivo `.env` en esta carpeta con:
   ```
   IA_API_KEY=la-clave
   ```
3. Para la publicación diaria, cargar la misma clave en GitHub: Settings → Secrets and variables → Actions → New repository secret, con el nombre `IA_API_KEY`.

El sitio elige solo el mejor modelo "Flash" disponible en la cuenta. Para fijar uno, se define `IA_MODELO` (en `.env`, o como variable del repositorio en GitHub). Usa solo 2 pedidos por día (hoy y mañana); los límites del plan gratuito se ven en AI Studio.

Cualquier otro proveedor con API compatible con OpenAI (Groq, OpenRouter, etc.) funciona cambiando `IA_BASE_URL`.

## Publicación automática (gratis)

`.github/workflows/diario.yml` regenera y publica el sitio en GitHub Pages todos los días a las 00:05 de Argentina.

1. Crear un repositorio en GitHub y subir esta carpeta.
2. En el repositorio: Settings → Pages → Source: **GitHub Actions**.
3. Opcional: apuntar el dominio propio (Settings → Pages → Custom domain) y poner esa URL en `config.mjs`.

GitHub pausa las tareas programadas de un repositorio sin actividad durante 60 días. Si pasa, se reactivan con un clic desde la pestaña Actions.

## Publicidad

Con la cuenta de AdSense aprobada, se completa `adsenseClient` en `config.mjs` (por ejemplo `ca-pub-123…`) y los espacios reservados pasan a mostrar anuncios reales.

## Próximos pasos posibles

- Horóscopo semanal y mensual.
- Derivar consultas de tarot a un profesional (comisión por consulta).
- Versión por país (zona horaria y moneda local) copiando `config.mjs`.
