// Banco de frases. El generador elige y combina según la posición real de los planetas
// respecto de cada signo (casas solares), así cada día y cada signo tienen un texto distinto.

// Luna en cada casa solar: el clima general del día.
export const GENERAL = {
  1: [
    'La Luna pasa por tu signo y te pone en el centro de la escena. Tus emociones están a flor de piel, pero también tu capacidad de arrancar cosas nuevas.',
    'Hoy la energía está de tu lado: la Luna transita tu propio signo y te da impulso para tomar decisiones sobre ti y tu imagen.',
    'Día de renovación personal. Con la Luna en tu signo, es buen momento para escuchar lo que realmente quieres y animarte a pedirlo.',
  ],
  2: [
    'La Luna activa tu zona de recursos: el foco está en el dinero, en lo que valoras y en cómo te sientes contigo mismo.',
    'Jornada para ordenar tus finanzas y darte un gusto sin culpa. La Luna te invita a pensar qué te da seguridad de verdad.',
    'Tu autoestima pide atención. Con la Luna en tu casa de los valores, reconoce lo que ya construiste antes de ir por más.',
  ],
  3: [
    'Mensajes, llamadas y conversaciones llenan tu agenda. La Luna favorece los trámites, los viajes cortos y los acuerdos con gente cercana.',
    'Tu mente está rápida y curiosa. Es un buen día para escribir, aprender algo nuevo o resolver temas pendientes con hermanos o vecinos.',
    'La Luna activa tu sector de la comunicación: lo que digas hoy tiene peso, así que elige bien las palabras y no dejes respuestas para después.',
  ],
  4: [
    'El hogar y la familia te reclaman. La Luna te pide bajar el ritmo, estar en tu lugar y cuidar a los tuyos.',
    'Día para mirar hacia adentro y ocuparte de tu casa. Un arreglo, una charla familiar o simplemente quedarte tranquilo te hará bien.',
    'Las emociones del pasado pueden aparecer hoy. La Luna en tu casa de las raíces trae recuerdos que conviene escuchar sin quedarte atrapado en ellos.',
  ],
  5: [
    'La Luna enciende tu lado creativo y romántico. Date permiso para disfrutar, jugar y hacer algo solo porque te gusta.',
    'Jornada luminosa para el amor, los hobbies y todo lo que te divierte. Tu encanto está en alza y la gente lo nota.',
    'Hoy conviene seguir al corazón. La Luna favorece las citas, los proyectos creativos y el tiempo con los chicos de la familia.',
  ],
  6: [
    'Día para ordenar la rutina y ponerte al día con el trabajo. La Luna te da paciencia para los detalles que venías postergando.',
    'Tu cuerpo te habla: la Luna en tu casa de la salud pide descanso, buena comida y algo de movimiento.',
    'Jornada productiva si organizas bien los tiempos. Pequeños cambios en tus hábitos hoy tienen un efecto grande a largo plazo.',
  ],
  7: [
    'Los vínculos son protagonistas. La Luna en tu casa de la pareja y los socios pide escuchar al otro y buscar acuerdos.',
    'Hoy no te conviene ir solo: una alianza, una conversación de a dos o el apoyo de alguien cercano te abre puertas.',
    'Alguien puede reflejarte algo que no estabas viendo. La Luna frente a tu signo te invita a equilibrar lo que das y lo que recibes.',
  ],
  8: [
    'Jornada intensa a nivel emocional. La Luna toca temas profundos: confianza, intimidad y recursos compartidos.',
    'Es buen día para cerrar deudas, revisar cuentas en común o hablar de algo que venías evitando.',
    'La Luna te lleva a lo profundo. Algo que termina deja lugar a algo nuevo; no te resistas al cambio.',
  ],
  9: [
    'Tu mente pide horizonte. La Luna favorece los viajes, los estudios y todo lo que amplíe tu forma de ver las cosas.',
    'Día optimista: una idea nueva, un curso o un plan de viaje te devuelven el entusiasmo.',
    'La Luna te invita a salir de lo conocido. Una conversación con alguien de otra cultura o generación puede inspirarte.',
  ],
  10: [
    'Tu carrera está en primer plano. La Luna te pone a la vista: buen momento para mostrar tu trabajo y hablar con superiores.',
    'Jornada para enfocarte en tus metas. Lo que hagas hoy en lo profesional deja huella.',
    'La Luna en lo más alto de tu cielo trae responsabilidades, pero también reconocimiento si te mantienes firme.',
  ],
  11: [
    'Amigos, grupos y proyectos a futuro te dan energía. La Luna favorece el trabajo en equipo y las redes de contacto.',
    'Día social: un mensaje a un viejo amigo o un encuentro grupal puede traer una oportunidad inesperada.',
    'Tus deseos a largo plazo se aclaran. La Luna te ayuda a ver quiénes te acompañan de verdad en tus planes.',
  ],
  12: [
    'Jornada para bajar el volumen y recargar energía. La Luna en tu casa doce pide descanso, silencio e introspección.',
    'Tu intuición está muy activa. Presta atención a tus sueños y a esas corazonadas que aparecen sin aviso.',
    'Es momento de cerrar ciclos antes de que la Luna llegue a tu signo. Suelta lo que ya no suma y prepárate para empezar de nuevo.',
  ],
};

export const FASE = {
  'nueva': 'La Luna nueva es ideal para sembrar intenciones: anota lo que quieres empezar.',
  'creciente-iluminante': 'Con la Luna creciente, lo que empieces ahora toma fuerza día a día.',
  'cuarto-creciente': 'El cuarto creciente pide acción: es momento de destrabar lo que se frenó.',
  'gibosa-creciente': 'La Luna casi llena invita a ajustar detalles antes de ver resultados.',
  'llena': 'La Luna llena ilumina todo: las emociones se intensifican y salen verdades a la luz.',
  'gibosa-menguante': 'Con la Luna menguando, es buen momento para compartir lo aprendido y agradecer.',
  'cuarto-menguante': 'El cuarto menguante favorece soltar, limpiar y cerrar asuntos pendientes.',
  'menguante': 'La Luna menguante pide descanso y balance antes del próximo ciclo.',
};

// Venus por casa solar: amor y vínculos.
export const AMOR = {
  1: ['Venus en tu signo te vuelve irresistible: tu magnetismo está en su mejor momento.', 'Te sientes atractivo y la gente se acerca sola. Aprovecha para mostrarte tal cual eres.'],
  2: ['En el amor buscas seguridad y gestos concretos más que palabras.', 'Un detalle material, un regalo o una salida especial fortalece el vínculo.'],
  3: ['Las palabras dulces son tu mejor arma: un mensaje a tiempo puede encender algo.', 'El coqueteo fluye en las conversaciones; alguien cercano puede sorprenderte.'],
  4: ['El amor se vive puertas adentro: una cena en casa vale más que cualquier salida.', 'Necesitas sentirte contenido; busca a quien te dé paz y no drama.'],
  5: ['Venus en tu casa del romance trae una etapa ideal para enamorarse o reavivar la llama.', 'Citas, risas y química: el corazón está de fiesta.'],
  6: ['El amor se demuestra en lo cotidiano: ayudar, acompañar y estar presente.', 'Puede surgir una atracción en el trabajo o en tu rutina diaria.'],
  7: ['Venus favorece a la pareja: buen momento para formalizar, reconciliarse o hacer planes juntos.', 'Si estás solo, alguien con quien te complementas muy bien puede aparecer pronto.'],
  8: ['La pasión y la intimidad se intensifican; el vínculo pide profundidad, no superficialidad.', 'Un tema de confianza en pareja se puede sanar si hablas con honestidad.'],
  9: ['El amor llega desde lejos o a través de un viaje, un curso o redes sociales.', 'Necesitas una pareja que te haga crecer y te abra la cabeza.'],
  10: ['Tu vida amorosa y tu imagen pública se cruzan: alguien te admira más de lo que crees.', 'Un vínculo puede ayudarte también en lo profesional.'],
  11: ['Una amistad podría convertirse en algo más; mira bien a tu grupo.', 'El amor se disfruta en grupo: salidas con amigos traen buenas sorpresas.'],
  12: ['Romance secreto o sentimientos que todavía no te animas a decir. Date tiempo.', 'Es momento de sanar heridas amorosas del pasado antes de abrir una nueva puerta.'],
};

// Marte por casa solar: trabajo, dinero y acción.
export const DINERO = {
  1: ['Tienes energía de sobra para ir por lo que quieres: toma la iniciativa en el trabajo.', 'Tu empuje impresiona; canalízalo en un objetivo concreto y no en discusiones.'],
  2: ['Marte activa tus ingresos: buen momento para negociar un aumento o buscar ingresos extra.', 'Cuidado con los gastos impulsivos; tu energía está puesta en el dinero.'],
  3: ['Trámites, contratos y negociaciones avanzan si eres claro y directo.', 'Una idea que compartas hoy puede convertirse en un buen negocio.'],
  4: ['Temas de vivienda o inmuebles se mueven; es momento de decisiones sobre tu casa.', 'Trabajar desde casa te rinde más de lo habitual.'],
  5: ['Un proyecto creativo puede generar dinero; apuesta por lo que te apasiona.', 'Evita las apuestas y los riesgos innecesarios con tus ahorros.'],
  6: ['Mucho trabajo y ritmo intenso; organízate para no quemarte.', 'Tu eficiencia se nota: es buen momento para mostrar resultados.'],
  7: ['Las sociedades y los acuerdos son clave; negocia con firmeza pero sin imponer.', 'Un competidor o socio te desafía; responde con estrategia, no con impulso.'],
  8: ['Revisa deudas, créditos e inversiones; es buen momento para reestructurar.', 'Dinero de terceros o una herencia pueden ser tema de conversación.'],
  9: ['Oportunidades vinculadas a otros lugares, viajes o estudios.', 'Capacitarte ahora es la mejor inversión que puedes hacer.'],
  10: ['Marte en lo alto de tu cielo te da ambición y visibilidad: ve por ese ascenso.', 'Tu carrera pide acción; no esperes a que te den permiso.'],
  11: ['Tus contactos te abren puertas laborales; activa tu red.', 'Un proyecto en equipo puede despegar si todos reman para el mismo lado.'],
  12: ['Trabaja en silencio: lo que prepares ahora dará frutos más adelante.', 'Evita conflictos ocultos en el trabajo y cuida la información que compartes.'],
};

export const JUPITER_BONUS = {
  2: 'Júpiter favorece tus finanzas: es un período de crecimiento económico.',
  6: 'Júpiter trae mejoras en tu ambiente laboral y en tu salud.',
  10: 'Júpiter respalda tu carrera: es una etapa de avances profesionales.',
  5: 'Júpiter expande tu creatividad y tu suerte en el amor.',
  9: 'Júpiter abre puertas en estudios, viajes y proyectos de largo alcance.',
  11: 'Júpiter multiplica tus contactos y oportunidades en grupo.',
  1: 'Júpiter en tu signo trae una etapa de expansión y optimismo personal.',
  7: 'Júpiter favorece las asociaciones y la vida en pareja.',
};

export const RETRO = {
  Mercury: 'Con Mercurio retrógrado, revisa dos veces mensajes y contratos antes de firmar.',
  Venus: 'Venus retrógrado puede traer personas del pasado: piensa antes de reabrir historias.',
  Mars: 'Marte retrógrado pide prudencia: no fuerces situaciones, revisa antes de avanzar.',
};

export const SALUD = {
  alta: [
    'Tu energía está alta: aprovecha para moverte, salir a caminar o practicar tu deporte favorito.',
    'Te sientes vital y con buen ánimo. Mantén el ritmo con buen descanso.',
    'Buen día para empezar un hábito saludable; tu cuerpo responde bien.',
  ],
  media: [
    'Energía estable: no te exijas de más y respeta tus horarios de comida y sueño.',
    'Un poco de aire libre y desconexión de las pantallas te harán bien.',
    'Hidrátate y date pausas cortas durante el día para no acumular tensión.',
  ],
  baja: [
    'Puedes sentirte algo cansado: prioriza el descanso y evita sobrecargarte.',
    'El estrés se acumula en el cuerpo; prueba respirar profundo o estirarte un rato.',
    'Día para ir más despacio. Una infusión, música tranquila y dormir temprano.',
  ],
};

export const CONSEJOS = [
  'Lo que no se dice, no se resuelve.',
  'Hoy, menos es más.',
  'Confía en el proceso, aunque todavía no veas el resultado.',
  'Antes de responder, respira.',
  'Una pequeña acción vale más que mil planes.',
  'Rodéate de quien te suma.',
  'No todo lo urgente es importante.',
  'Agradece algo antes de dormir.',
  'Tu intuición sabe algo que tu mente todavía no.',
  'Pide ayuda: no tienes que poder con todo.',
  'Ordena tu espacio y se ordenará tu cabeza.',
  'Haz hoy eso que vienes postergando.',
  'Escucha más de lo que hablas.',
  'Elige la paz antes que tener la razón.',
  'Date un gusto, te lo mereces.',
  'Cambia la rutina aunque sea en algo pequeño.',
  'Lo que hoy parece un final es un comienzo.',
  'Pon límites con cariño.',
  'Sal a caminar sin el teléfono.',
  'Celebra los avances, por pequeños que sean.',
  'No compares tu camino con el de nadie.',
  'Suelta lo que no puedes controlar.',
  'Una charla sincera puede cambiar tu semana.',
  'Tu palabra tiene valor: cuídala.',
  'Duerme bien, decide mejor.',
];

export const COLORES = ['rojo', 'naranja', 'amarillo', 'verde', 'turquesa', 'azul', 'violeta', 'rosa', 'blanco', 'dorado', 'plateado', 'bordó', 'celeste', 'verde agua', 'lila', 'coral'];

export const TITULARES = {
  alta: ['Un día para brillar', 'La energía está de tu lado', 'Jornada de buenas noticias', 'El cielo te sonríe', 'Momento de avanzar'],
  media: ['Un día para ajustar detalles', 'Paso a paso', 'Jornada de equilibrio', 'Tiempo de ordenar', 'Escucha antes de actuar'],
  baja: ['Un día para ir despacio', 'Paciencia y descanso', 'Mejor observar que reaccionar', 'Cuida tu energía', 'Jornada para mirar hacia adentro'],
};
