// Textos de la carta natal y de la frase del día personalizada.

// Qué dice la Luna natal según el signo: el mundo emocional.
export const LUNA_EN = {
  aries: 'Sientes rápido y con intensidad. Te enojas y se te pasa enseguida; necesitas acción para sentirte bien.',
  tauro: 'Tu calma emocional viene de lo estable: tu casa, tu rutina, la buena comida y la gente de siempre.',
  geminis: 'Procesas lo que sientes hablándolo. Necesitas conversación, estímulo y variedad para estar en paz.',
  cancer: 'Es la Luna en su casa: sensible, protectora y muy intuitiva. La familia y los recuerdos te marcan profundo.',
  leo: 'Necesitas sentirte querido y valorado. Das mucho cariño y te encanta que te lo devuelvan con gestos.',
  virgo: 'Te calma tener todo en orden. Muestras tu cariño ayudando y cuidando los detalles.',
  libra: 'Buscas armonía en tus vínculos. Los conflictos te desestabilizan y te sientes mejor acompañado.',
  escorpio: 'Sientes todo en profundidad y no te gustan las medias tintas. Tu intuición es casi infalible.',
  sagitario: 'Necesitas libertad y horizonte. El optimismo y la aventura son tu forma de sanar.',
  capricornio: 'Cuidas tus emociones con prudencia. Te muestras fuerte, aunque por dentro sientes mucho.',
  acuario: 'Necesitas espacio propio para procesar. Te sientes en casa entre amigos y con gente que piensa distinto.',
  piscis: 'Eres una esponja emocional: absorbes lo que sienten los demás. La música, el arte y el descanso te recargan.',
};

// Qué dice el Ascendente según el signo: la primera impresión y el estilo personal.
export const ASC_EN = {
  aries: 'Das una primera impresión enérgica y directa. Encaras la vida de frente y con iniciativa.',
  tauro: 'Transmites calma, seguridad y buen gusto. La gente siente que puede confiar en ti.',
  geminis: 'Pareces curioso, simpático y conversador. Te adaptas rápido a cualquier ambiente.',
  cancer: 'Te muestras cálido y protector. La gente se siente contenida a tu lado.',
  leo: 'Tienes presencia: se nota cuando llegas. Transmites confianza y generosidad.',
  virgo: 'Das una imagen prolija, atenta y servicial. Notas los detalles que otros pasan por alto.',
  libra: 'Eres encantador y diplomático. Cuidas la estética y sabes hacer sentir bien a los demás.',
  escorpio: 'Tu mirada es intensa y magnética. Pareces reservado, pero no se te escapa nada.',
  sagitario: 'Transmites optimismo y ganas de aventura. Tu sentido del humor abre puertas.',
  capricornio: 'Das una imagen seria, responsable y madura. La gente confía en tu criterio.',
  acuario: 'Pareces original, independiente y un poco imprevisible. Te gusta romper moldes.',
  piscis: 'Transmites dulzura y sensibilidad. Tienes un aire soñador y artístico.',
};

// Frase del día según la casa por la que pasa la Luna (contada desde el Ascendente o el signo solar).
export const FRASE_CASA = {
  1: ['Hoy el protagonismo es tuyo: muéstrate tal como eres.', 'Tu energía está alta: úsala para empezar eso que vienes postergando.', 'Ponte primero en la lista hoy, sin culpa.'],
  2: ['Lo que vales no depende de lo que tienes, pero hoy conviene ordenar tus cuentas.', 'Disfruta de un placer simple: te lo mereces.', 'Hoy es buen día para cuidar lo que ya es tuyo.'],
  3: ['Una conversación de hoy puede cambiarte el día: escucha y habla con el corazón.', 'Escribe ese mensaje que tienes pendiente.', 'La curiosidad te guía: pregunta, lee, sal a recorrer.'],
  4: ['Hoy tu lugar en el mundo es tu casa: date un momento para estar en ella.', 'Llama a alguien de tu familia: te va a hacer bien a ti también.', 'Ordena tu espacio y se ordenará tu cabeza.'],
  5: ['Hoy permítete jugar, crear y disfrutar sin buscar un para qué.', 'El corazón está más abierto que de costumbre: déjate sorprender.', 'Haz algo solo porque te divierte.'],
  6: ['Los pequeños hábitos de hoy construyen el bienestar de mañana.', 'Una tarea a la vez: hoy la clave es el orden.', 'Escucha a tu cuerpo: te está pidiendo algo.'],
  7: ['Hoy las respuestas llegan a través de otra persona.', 'Un acuerdo justo vale más que tener razón.', 'Mira a quien tienes al lado: hoy es buen día para el equipo.'],
  8: ['Hay algo que necesitas soltar para poder transformarte.', 'Hoy la confianza se construye mostrándose vulnerable.', 'Mira debajo de la superficie: ahí está la verdad del día.'],
  9: ['Hoy la mente pide horizonte: aprende algo nuevo o planea un viaje.', 'Una idea grande se te cruza hoy: anótala.', 'Mira la situación con perspectiva y todo se achica.'],
  10: ['Hoy lo que haces se ve: da lo mejor de ti.', 'Un paso concreto hacia tu meta vale más que mil planes.', 'Es buen día para mostrar tu trabajo y pedir lo que mereces.'],
  11: ['Tus amigos son tu mejor red hoy: apóyate en ellos.', 'Piensa en el futuro que quieres y da un pequeño paso hacia él.', 'Hoy compartir una idea la hace crecer.'],
  12: ['Hoy el silencio te dice más que el ruido: date un rato a solas.', 'Descansa sin culpa: estás recargando energía para lo que viene.', 'Confía en tu intuición, aunque no puedas explicarla.'],
};

// Aspecto que forma la Luna del día con tu Sol natal.
export const ASPECTO_SOL = {
  conjuncion: 'La Luna pasa sobre tu Sol natal: te sientes más tú que nunca. Es un pequeño comienzo personal.',
  sextil: 'La Luna forma un sextil con tu Sol natal: aparecen oportunidades si das el primer paso.',
  cuadratura: 'La Luna forma una cuadratura con tu Sol natal: algún roce te empuja a moverte. Respira antes de reaccionar.',
  trigono: 'La Luna forma un trígono con tu Sol natal: el ánimo y la voluntad van en la misma dirección. Día fluido.',
  oposicion: 'La Luna está opuesta a tu Sol natal: lo que sientes y lo que quieres tiran para lados distintos. Busca el punto medio.',
};
