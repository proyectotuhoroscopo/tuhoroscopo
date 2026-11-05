// Ficha fija de cada signo.
export const SIGNOS = {
  aries: {
    nombre: 'Aries', simbolo: '♈', fechas: '21 de marzo – 19 de abril', elemento: 'fuego', modalidad: 'cardinal', regente: 'Mars',
    rasgos: ['valiente', 'impulsivo', 'directo', 'competitivo'],
    perfil: 'Aries abre el zodíaco y tiene esa energía de comienzo: arranca proyectos, toma la iniciativa y no le teme a la competencia. Su desafío es sostener lo que empieza y frenar un segundo antes de reaccionar.',
    fortalezas: 'Coraje, entusiasmo contagioso y capacidad de liderazgo.',
    debilidades: 'Impaciencia, poca tolerancia a la espera y cierta tendencia a discutir.',
  },
  tauro: {
    nombre: 'Tauro', simbolo: '♉', fechas: '20 de abril – 20 de mayo', elemento: 'tierra', modalidad: 'fijo', regente: 'Venus',
    rasgos: ['constante', 'sensual', 'práctico', 'leal'],
    perfil: 'Tauro construye despacio pero firme. Valora la seguridad, el placer de las cosas simples y la lealtad. Cuando se compromete, no suelta; su aprendizaje es aceptar los cambios que no eligió.',
    fortalezas: 'Paciencia, perseverancia y un gran sentido práctico.',
    debilidades: 'Terquedad, resistencia al cambio y apego a lo material.',
  },
  geminis: {
    nombre: 'Géminis', simbolo: '♊', fechas: '21 de mayo – 20 de junio', elemento: 'aire', modalidad: 'mutable', regente: 'Mercury',
    rasgos: ['curioso', 'comunicativo', 'versátil', 'ingenioso'],
    perfil: 'Géminis vive conectando ideas y personas. Aprende rápido, se adapta a todo y siempre tiene una conversación pendiente. Su reto es enfocar tanta energía mental en pocas cosas a la vez.',
    fortalezas: 'Agilidad mental, humor y facilidad para comunicarse.',
    debilidades: 'Dispersión, ansiedad y cambios de opinión frecuentes.',
  },
  cancer: {
    nombre: 'Cáncer', simbolo: '♋', fechas: '21 de junio – 22 de julio', elemento: 'agua', modalidad: 'cardinal', regente: 'Moon',
    rasgos: ['protector', 'sensible', 'intuitivo', 'familiero'],
    perfil: 'Cáncer cuida, contiene y recuerda. El hogar y los vínculos cercanos son su centro, y su intuición rara vez falla. Aprende a poner límites sin cerrarse en su caparazón.',
    fortalezas: 'Empatía, memoria emocional y capacidad de cuidar.',
    debilidades: 'Susceptibilidad, cambios de humor y dificultad para soltar el pasado.',
  },
  leo: {
    nombre: 'Leo', simbolo: '♌', fechas: '23 de julio – 22 de agosto', elemento: 'fuego', modalidad: 'fijo', regente: 'Sun',
    rasgos: ['generoso', 'carismático', 'creativo', 'orgulloso'],
    perfil: 'Leo brilla y hace brillar a quienes lo rodean. Es generoso, creativo y tiene un corazón enorme. Su lección es no depender del aplauso ajeno para sentirse valioso.',
    fortalezas: 'Carisma, generosidad y confianza en sí mismo.',
    debilidades: 'Orgullo, necesidad de reconocimiento y dramatismo.',
  },
  virgo: {
    nombre: 'Virgo', simbolo: '♍', fechas: '23 de agosto – 22 de septiembre', elemento: 'tierra', modalidad: 'mutable', regente: 'Mercury',
    rasgos: ['analítico', 'servicial', 'detallista', 'trabajador'],
    perfil: 'Virgo ve lo que otros pasan por alto. Ordena, mejora y resuelve con una eficacia admirable. Su desafío es ser tan amable consigo mismo como lo es con los demás.',
    fortalezas: 'Precisión, sentido del deber y capacidad de análisis.',
    debilidades: 'Autoexigencia, perfeccionismo y tendencia a preocuparse de más.',
  },
  libra: {
    nombre: 'Libra', simbolo: '♎', fechas: '23 de septiembre – 22 de octubre', elemento: 'aire', modalidad: 'cardinal', regente: 'Venus',
    rasgos: ['diplomático', 'sociable', 'estético', 'justo'],
    perfil: 'Libra busca el equilibrio y la belleza en todo. Es el mediador natural del zodíaco y disfruta de la vida compartida. Aprende a decidir sin esperar que todos estén de acuerdo.',
    fortalezas: 'Diplomacia, encanto y sentido de la justicia.',
    debilidades: 'Indecisión, evitar el conflicto y depender de la opinión ajena.',
  },
  escorpio: {
    nombre: 'Escorpio', simbolo: '♏', fechas: '23 de octubre – 21 de noviembre', elemento: 'agua', modalidad: 'fijo', regente: 'Pluto',
    rasgos: ['intenso', 'magnético', 'leal', 'reservado'],
    perfil: 'Escorpio va siempre a lo profundo. Es intenso, perceptivo y capaz de transformarse por completo. Su camino es confiar sin necesidad de controlarlo todo.',
    fortalezas: 'Determinación, intuición y capacidad de regeneración.',
    debilidades: 'Celos, desconfianza y dificultad para perdonar.',
  },
  sagitario: {
    nombre: 'Sagitario', simbolo: '♐', fechas: '22 de noviembre – 21 de diciembre', elemento: 'fuego', modalidad: 'mutable', regente: 'Jupiter',
    rasgos: ['optimista', 'aventurero', 'franco', 'libre'],
    perfil: 'Sagitario necesita horizonte: viajar, aprender, explorar. Es optimista, honesto y contagia ganas de vivir. Su desafío es comprometerse sin sentir que pierde libertad.',
    fortalezas: 'Optimismo, sentido del humor y amplitud de mente.',
    debilidades: 'Impaciencia, exceso de franqueza y promesas que no siempre cumple.',
  },
  capricornio: {
    nombre: 'Capricornio', simbolo: '♑', fechas: '22 de diciembre – 19 de enero', elemento: 'tierra', modalidad: 'cardinal', regente: 'Saturn',
    rasgos: ['ambicioso', 'responsable', 'disciplinado', 'paciente'],
    perfil: 'Capricornio sube la montaña paso a paso. Es responsable, estratégico y sabe que los logros llevan tiempo. Aprende a disfrutar el camino y no solo la cima.',
    fortalezas: 'Disciplina, constancia y visión a largo plazo.',
    debilidades: 'Rigidez, pesimismo y exceso de trabajo.',
  },
  acuario: {
    nombre: 'Acuario', simbolo: '♒', fechas: '20 de enero – 18 de febrero', elemento: 'aire', modalidad: 'fijo', regente: 'Uranus',
    rasgos: ['original', 'independiente', 'humanitario', 'visionario'],
    perfil: 'Acuario piensa en el futuro y en el bien común. Es original, independiente y no le teme a ser distinto. Su reto es conectar con lo emocional tanto como con las ideas.',
    fortalezas: 'Creatividad, mente abierta y espíritu solidario.',
    debilidades: 'Distancia emocional, rebeldía y terquedad con sus ideas.',
  },
  piscis: {
    nombre: 'Piscis', simbolo: '♓', fechas: '19 de febrero – 20 de marzo', elemento: 'agua', modalidad: 'mutable', regente: 'Neptune',
    rasgos: ['soñador', 'compasivo', 'artístico', 'intuitivo'],
    perfil: 'Piscis siente todo y lo transforma en arte, ayuda o intuición. Es compasivo, imaginativo y profundamente espiritual. Aprende a cuidar su energía y a poner los pies en la tierra.',
    fortalezas: 'Empatía, imaginación y sensibilidad artística.',
    debilidades: 'Evasión, confusión y dificultad para decir que no.',
  },
};

export const PLANETA_NOMBRE = {
  Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus', Mars: 'Marte',
  Jupiter: 'Júpiter', Saturn: 'Saturno', Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Plutón',
};

export const PLANETA_SIMBOLO = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

export const ELEMENTO = { fuego: 'Fuego', tierra: 'Tierra', aire: 'Aire', agua: 'Agua' };
