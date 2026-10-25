/**
 * TRIVIA BÍBLICA - ¿QUIÉN QUIERE SER MILLONARIO? (8-BIT)
 * IASD Pacajes - ORIÓN Arcade
 */

// ==========================================
// 1. WEB AUDIO API - TENSION & SOUND EFFECTS
// ==========================================
class TriviaAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(660, t + 0.05);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playLockAnswer() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(164.81, t + 0.1);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  playCorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t + idx * 0.08);
      gain.gain.setValueAtTime(0.16, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.25);
    });
  }

  playWrong() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.setValueAtTime(80, t + 0.2);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.7);
  }

  playLifeline() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const freqs = [330, 493.88, 659.25, 880];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + idx * 0.06);
      gain.gain.setValueAtTime(0.18, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.18);
    });
  }

  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.35 },
      { f: 783.99, d: 0.25 },
      { f: 1046.50, d: 0.8 }
    ];
    let curTime = t;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, curTime);
      gain.gain.setValueAtTime(0.2, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(curTime);
      osc.stop(curTime + n.d);
      curTime += n.d * 0.85;
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

const sound = new TriviaAudio();

// ==========================================
// 2. THE 15-TIER PRIZE LADDER VALUES
// ==========================================
const LADDER_PRIZES = [
  { level: 1,  amount: 100,       str: '100',       isSafe: false },
  { level: 2,  amount: 200,       str: '200',       isSafe: false },
  { level: 3,  amount: 300,       str: '300',       isSafe: false },
  { level: 4,  amount: 500,       str: '500',       isSafe: false },
  { level: 5,  amount: 1000,      str: '1,000',     isSafe: true  }, // CHECKPOINT 1 🛡️
  { level: 6,  amount: 2000,      str: '2,000',     isSafe: false },
  { level: 7,  amount: 4000,      str: '4,000',     isSafe: false },
  { level: 8,  amount: 8000,      str: '8,000',     isSafe: false },
  { level: 9,  amount: 16000,     str: '16,000',    isSafe: false },
  { level: 10, amount: 32000,     str: '32,000',    isSafe: true  }, // CHECKPOINT 2 🛡️
  { level: 11, amount: 64000,     str: '64,000',    isSafe: false },
  { level: 12, amount: 125000,    str: '125,000',   isSafe: false },
  { level: 13, amount: 250000,    str: '250,000',   isSafe: false },
  { level: 14, amount: 500000,    str: '500,000',   isSafe: false },
  { level: 15, amount: 1000000,   str: '1,000,000', isSafe: true  }  // GRAND PRIZE 👑
];

// ==========================================
// 3. EXPANDED COMPREHENSIVE BIBLICAL DB
// (8 questions per level = 120 unique questions)
// ==========================================
const QUESTIONS_DB = {
  1: [
    {
      q: '¿Quién construyó el arca para salvar a su familia y a los animales del diluvio?',
      opts: ['Moisés', 'Noé', 'Abraham', 'David'],
      correct: 1,
      hint: 'Génesis relata cómo este varón justo halló gracia ante los ojos de Dios.',
      context: 'Génesis 6-8'
    },
    {
      q: '¿En cuántos días creó Dios los cielos y la tierra antes de reposar en el séptimo?',
      opts: ['3 días', '6 días', '12 días', '40 días'],
      correct: 1,
      hint: 'Al finalizar el sexto día, vio Dios todo lo que había hecho, y era bueno en gran manera.',
      context: 'Génesis 1 y 2'
    },
    {
      q: '¿Quién fue el primer hombre creado por Dios a su imagen y semejanza?',
      opts: ['Adán', 'Enoc', 'Matusalén', 'Caín'],
      correct: 0,
      hint: 'Fue formado del polvo de la tierra y puesto en el huerto del Edén.',
      context: 'Génesis 2:7'
    },
    {
      q: '¿Quién fue arrojado al foso de los leones por orar fielmente a Dios tres veces al día?',
      opts: ['Daniel', 'Jeremías', 'Ezequiel', 'Isaías'],
      correct: 0,
      hint: 'Dios envió a su ángel, el cual cerró la boca de los leones.',
      context: 'Daniel 6'
    },
    {
      q: '¿En qué humilde aldea de Judea nació nuestro Señor Jesucristo?',
      opts: ['Nazaret', 'Jerusalén', 'Belén', 'Jericó'],
      correct: 2,
      hint: 'Profetizado en Miqueas 5:2 como pequeña para estar entre las familias de Judá.',
      context: 'Miqueas 5:2, Mateo 2:1'
    },
    {
      q: '¿Qué oficio desempeñaba el joven David antes de ser ungido como rey de Israel?',
      opts: ['Pescador', 'Pastor de ovejas', 'Carpintero', 'Alfarero'],
      correct: 1,
      hint: 'Cuidaba las ovejas de su padre Isaí en los campos de Belén.',
      context: '1 Samuel 16:11'
    },
    {
      q: '¿Qué santuario portátil construyó Israel en el desierto para la presencia de Dios?',
      opts: ['El Tabernáculo', 'La Pirámide', 'El Coliseo', 'El Zigurat'],
      correct: 0,
      hint: 'Construido conforme al modelo que le fue mostrado a Moisés en el monte.',
      context: 'Éxodo 25:8-9'
    },
    {
      q: '¿Cómo se llamaba la primera mujer, creada como ayuda idónea para el hombre?',
      opts: ['Sara', 'Eva', 'Rebeca', 'Lea'],
      correct: 1,
      hint: 'Llamada madre de todos los vivientes en el libro de Génesis.',
      context: 'Génesis 3:20'
    }
  ],
  2: [
    {
      q: '¿Qué instrumento tocaba David para calmar el espíritu atormentado del rey Saúl?',
      opts: ['Trompeta', 'Arpa', 'Flauta', 'Tamboril'],
      correct: 1,
      hint: 'Un instrumento de cuerdas con el que el dulce cantor de Israel alababa al Señor.',
      context: '1 Samuel 16:23'
    },
    {
      q: '¿Quién fue tragado por un gran pez tras intentar huir en barco hacia Tarsis?',
      opts: ['Jonás', 'Elías', 'Jeremías', 'Oseas'],
      correct: 0,
      hint: 'Estuvo tres días y tres noches en el vientre del pez antes de ir a predicar a Nínive.',
      context: 'Jonás 1 y 2'
    },
    {
      q: '¿En qué río fue bautizado Jesús por Juan el Bautista?',
      opts: ['Río Nilo', 'Río Éufrates', 'Río Jordán', 'Río Tigris'],
      correct: 2,
      hint: 'El mismo río donde el pueblo de Israel cruzó guiado por Josué.',
      context: 'Mateo 3:13'
    },
    {
      q: '¿Cuántos discípulos escogió Jesús como sus apóstoles principales?',
      opts: ['7 discípulos', '10 discípulos', '12 discípulos', '70 discípulos'],
      correct: 2,
      hint: 'Simbolizan las doce tribus del nuevo Israel espiritual.',
      context: 'Mateo 10:1-4'
    },
    {
      q: '¿En qué se convirtió la esposa de Lot tras mirar atrás hacia Sodoma?',
      opts: ['Estatua de sal', 'Pilar de piedra', 'Columna de mármol', 'Árbol seco'],
      correct: 0,
      hint: 'Jesús nos advirtió en Lucas: "Acordaos de la mujer de Lot".',
      context: 'Génesis 19:26, Lucas 17:32'
    },
    {
      q: '¿Cómo se llamaba la famosa torre construida en Sinar donde Dios confundió las lenguas?',
      opts: ['Torre de Babel', 'Torre de Siloé', 'Torre de David', 'Torre de marfil'],
      correct: 0,
      hint: 'Su nombre significa precisamente confusión.',
      context: 'Génesis 11:1-9'
    },
    {
      q: '¿Quién rescató al bebé Moisés de las aguas del río Nilo dentro de una arquilla de juncos?',
      opts: ['La reina de Saba', 'La hija de Faraón', 'La madre de Sansón', 'Una sierva hebrea'],
      correct: 1,
      hint: 'Tuvo compasión de él diciendo: "De los niños de los hebreos es éste".',
      context: 'Éxodo 2:5-10'
    },
    {
      q: '¿Cuál es el primer libro de la Biblia, que narra los orígenes del universo?',
      opts: ['Éxodo', 'Génesis', 'Levítico', 'Deuteronomio'],
      correct: 1,
      hint: 'Comienza con las majestuosas palabras: "En el principio creó Dios los cielos y la tierra".',
      context: 'Génesis 1:1'
    }
  ],
  3: [
    {
      q: '¿Qué mar se dividió en dos para que el pueblo de Israel cruzara en seco?',
      opts: ['Mar Muerto', 'Mar Rojo', 'Mar de Galilea', 'Mar Mediterráneo'],
      correct: 1,
      hint: 'Moisés extendió su vara sobre sus aguas tras salir de Egipto.',
      context: 'Éxodo 14:21'
    },
    {
      q: '¿Qué alimento dulce milagroso envió Dios del cielo al pueblo de Israel cada mañana en el desierto?',
      opts: ['Maná', 'Higos secos', 'Cebada', 'Uvas'],
      correct: 0,
      hint: 'Era como semilla de culantro, blanco, y su sabor como de hojuelas con miel.',
      context: 'Éxodo 16:31'
    },
    {
      q: '¿Cuál era el nombre del gigante filisteo de Gat que David derrotó con una honda y una piedra?',
      opts: ['Goliat', 'Og de Basán', 'Anac', 'Nimrod'],
      correct: 0,
      hint: 'Desafió los escuadrones del Dios viviente durante cuarenta días.',
      context: '1 Samuel 17'
    },
    {
      q: '¿Cuántas plagas envió Dios sobre Egipto para que el Faraón dejara ir a su pueblo?',
      opts: ['7 plagas', '10 plagas', '12 plagas', '40 plagas'],
      correct: 1,
      hint: 'La última plaga fue la muerte de los primogénitos.',
      context: 'Éxodo 7-12'
    },
    {
      q: '¿Qué vio Moisés en el monte Horeb que ardía con fuego pero no se consumía?',
      opts: ['Un cedro', 'Una zarza', 'Un olivo', 'Una encina'],
      correct: 1,
      hint: 'Desde allí Dios le dijo: "Quita tu calzado de tus pies, porque el lugar en que tú estás, tierra santa es".',
      context: 'Éxodo 3:2-5'
    },
    {
      q: '¿Qué juez de Israel poseía una fuerza sobrehumana hasta que le cortaron el cabello?',
      opts: ['Gedeón', 'Sansón', 'Jefté', 'Barac'],
      correct: 1,
      hint: 'Nazareo consagrado a Dios desde el vientre de su madre.',
      context: 'Jueces 16'
    },
    {
      q: '¿Cómo se llamaba el ciego mendigo de Jericó que clamó a Jesús y recobró la vista?',
      opts: ['Zaqueo', 'Bartimeo', 'Malco', 'Lázaro'],
      correct: 1,
      hint: 'Hijo de Timeo, arrojó su capa y vino a Jesús.',
      context: 'Marcos 10:46-52'
    },
    {
      q: '¿Cuántas cestas llenas sobraron tras la multiplicación de los 5 panes y 2 peces para 5,000 hombres?',
      opts: ['3 cestas', '7 cestas', '12 cestas', '40 cestas'],
      correct: 2,
      hint: 'Una cesta por cada uno de los doce apóstoles.',
      context: 'Mateo 14:20'
    }
  ],
  4: [
    {
      q: '¿Qué reina judía arriesgó su vida diciendo: "Y si perezco, que perezca" para salvar a su pueblo?',
      opts: ['Rut', 'Ester', 'Sara', 'Rebeca'],
      correct: 1,
      hint: 'Prima de Mardoqueo que fue coronada reina en el imperio persa.',
      context: 'Ester 4:16'
    },
    {
      q: '¿Cuántos libros componen en total el Nuevo Testamento?',
      opts: ['39 libros', '27 libros', '66 libros', '12 libros'],
      correct: 1,
      hint: 'Comienza en Mateo y culmina en el libro profético de Apocalipsis.',
      context: 'Canon Bíblico'
    },
    {
      q: '¿Quién fue vendido por sus hermanos a unos mercaderes y llegó a ser gobernador de Egipto?',
      opts: ['Benjamín', 'José', 'Judá', 'Rubén'],
      correct: 1,
      hint: 'El hijo predilecto de Jacob a quien su padre le regaló una túnica de diversos colores.',
      context: 'Génesis 37 y 41'
    },
    {
      q: '¿En qué monte sagrado entregó Dios a Moisés las dos tablas de piedra de los Diez Mandamientos?',
      opts: ['Monte Nebo', 'Monte Sinaí (Horeb)', 'Monte Tabor', 'Monte Hermón'],
      correct: 1,
      hint: 'Todo el monte humeaba porque Jehová había descendido sobre él en fuego.',
      context: 'Éxodo 19 y 20'
    },
    {
      q: '¿Quién era el hombre de baja estatura que se subió a un árbol sicómoro para ver pasar a Jesús?',
      opts: ['Nicodemo', 'Zaqueo', 'Bartimeo', 'Simón'],
      correct: 1,
      hint: 'Jefe de los publicanos y rico en Jericó.',
      context: 'Lucas 19:1-10'
    },
    {
      q: '¿Qué famosas murallas cayeron derribadas tras rodearlas el pueblo de Israel durante siete días?',
      opts: ['Murallas de Tiro', 'Murallas de Jericó', 'Murallas de Babilonia', 'Murallas de Samaria'],
      correct: 1,
      hint: 'Cayeron cuando tocaron las trompetas de cuerno de carnero y todo el pueblo gritó.',
      context: 'Josué 6'
    },
    {
      q: '¿En qué parábola un hijo pide su herencia, la desperdicia y regresa arrepentido a su padre?',
      opts: ['El buen samaritano', 'El hijo pródigo', 'El sembrador', 'La dracma perdida'],
      correct: 1,
      hint: 'El padre corrió, se echó sobre su cuello y le besó.',
      context: 'Lucas 15:11-32'
    },
    {
      q: '¿Quién fue el fiel hermano de Moisés que ejerció como el primer Sumo Sacerdote de Israel?',
      opts: ['Aarón', 'Josué', 'Hur', 'Caleb'],
      correct: 0,
      hint: 'Hablaba elocuentemente y su vara floreció con almendras.',
      context: 'Éxodo 28:1'
    }
  ],
  5: [ // CHECKPOINT 1 (1,000 TALENTOS) 🛡️
    {
      q: '¿Quién fue el hombre más longevo mencionado en la Biblia, alcanzando los 969 años de vida?',
      opts: ['Enoc', 'Matusalén', 'Noé', 'Sem'],
      correct: 1,
      hint: 'Hijo de Enoc y abuelo de Noé, su nombre se asocia con una larga paciencia divina.',
      context: 'Génesis 5:27'
    },
    {
      q: '¿En qué monte descendió fuego de Dios en el desafío de Elías contra 450 profetas de Baal?',
      opts: ['Monte Sinaí', 'Monte Carmelo', 'Monte de los Olivos', 'Monte Nebo'],
      correct: 1,
      hint: 'Situado en la costa del Mediterráneo, donde clamó: "¡Respóndeme, Jehová, respóndeme!"',
      context: '1 Reyes 18:19-39'
    },
    {
      q: '¿Qué profeta fue arrebatado al cielo en un torbellino mediante un carro de fuego y caballos de fuego?',
      opts: ['Isaías', 'Elías', 'Eliseo', 'Jeremías'],
      correct: 1,
      hint: 'Dejó su manto a su discípulo Eliseo a la orilla del Jordán.',
      context: '2 Reyes 2:11'
    },
    {
      q: '¿Qué apóstol negó a Jesús tres veces antes de que cantara el gallo en la noche de su juicio?',
      opts: ['Juan', 'Pedro', 'Santiago', 'Tomás'],
      correct: 1,
      hint: 'Lloró amargamente al recordar la profecía de su Maestro.',
      context: 'Mateo 26:69-75'
    },
    {
      q: '¿Qué aves enviaba Dios milagrosamente al profeta Elías para alimentarlo junto al arroyo de Querit?',
      opts: ['Palomas', 'Cuervos', 'Águilas', 'Codornices'],
      correct: 1,
      hint: 'Le traían pan y carne por la mañana, y pan y carne por la tarde.',
      context: '1 Reyes 17:4-6'
    },
    {
      q: '¿Cuál de las ofrendas entre Caín y Abel fue agradable a Dios y mirada con agrado?',
      opts: ['Los frutos de Caín', 'Los primogénitos de las ovejas de Abel', 'Ambas por igual', 'Ninguna'],
      correct: 1,
      hint: 'Abel ofreció por la fe un más excelente sacrificio que Caín.',
      context: 'Génesis 4:4, Hebreos 11:4'
    },
    {
      q: '¿Qué rey de Israel pidió a Dios sabiduría e inteligencia en vez de riquezas o larga vida?',
      opts: ['Saúl', 'Salomón', 'Roboam', 'David'],
      correct: 1,
      hint: 'Dios se le apareció en sueños en Gabaón y le concedió un corazón sabio y entendido.',
      context: '1 Reyes 3:5-14'
    },
    {
      q: '¿Qué vara reverdeció milagrosamente produciendo flores y almendras maduras?',
      opts: ['La vara de Moisés', 'La vara de Aarón', 'La vara de Gedeón', 'La vara de Josué'],
      correct: 1,
      hint: 'Fue colocada delante del testimonio en el Tabernáculo.',
      context: 'Números 17:8'
    }
  ],
  6: [
    {
      q: '¿Cuál fue el primer milagro público de Jesús registrado en el Evangelio de Juan?',
      opts: ['Caminar sobre el mar', 'Multiplicar los panes', 'Convertir agua en vino en Caná', 'Sanar a un ciego'],
      correct: 2,
      hint: 'Ocurrió durante unas bodas en Galilea tras la petición de su madre María.',
      context: 'Juan 2:1-11'
    },
    {
      q: '¿Cómo se llamaba el amigo entrañable de Jesús que resucitó tras llevar cuatro días en la tumba?',
      opts: ['Lázaro', 'Bartimeo', 'Zaqueo', 'Nicodemo'],
      correct: 0,
      hint: 'Hermano de Marta y María, residente de la aldea de Betania.',
      context: 'Juan 11'
    },
    {
      q: '¿Qué joven cayó desde una ventana del tercer piso mientras Pablo predicaba y fue resucitado por él?',
      opts: ['Timoteo', 'Eutico', 'Tito', 'Filemón'],
      correct: 1,
      hint: 'El suceso ocurrió en Troas durante una reunión que se extendió hasta la medianoche.',
      context: 'Hechos 20:9-12'
    },
    {
      q: '¿Qué apóstol caminó sobre las aguas del mar hacia Jesús hasta que sintió miedo del viento?',
      opts: ['Andrés', 'Pedro', 'Juan', 'Felipe'],
      correct: 1,
      hint: 'Jesús le extendió la mano y le dijo: "¡Hombre de poca fe! ¿Por qué dudaste?".',
      context: 'Mateo 14:28-31'
    },
    {
      q: '¿En qué fiesta solemne descendió el Espíritu Santo sobre los discípulos como lenguas repartidas de fuego?',
      opts: ['La Pascua', 'Pentecostés', 'Los Tabernáculos', 'Las Trompetas'],
      correct: 1,
      hint: 'Ocurrió en el aposento alto estando todos unánimes juntos.',
      context: 'Hechos 2:1-4'
    },
    {
      q: '¿Quién era el íntimo amigo de David, hijo del rey Saúl, que amó a David como a su propia alma?',
      opts: ['Jonatán', 'Abner', 'Absalón', 'Is-boset'],
      correct: 0,
      hint: 'Le dio su manto, sus otras ropas, su espada y su arco.',
      context: '1 Samuel 18:1-4'
    },
    {
      q: '¿De dónde sacó Pedro una moneda para pagar el impuesto del templo para él y para Jesús?',
      opts: ['Del bolsillo de Judas', 'De la boca de un pez', 'De una vasija de aceite', 'De una ofrenda en la sinagoga'],
      correct: 1,
      hint: 'Jesús le mandó: "Ve al mar, echa el anzuelo, y el primer pez que suba, tómalo".',
      context: 'Mateo 17:27'
    },
    {
      q: '¿Cómo se llamaba la anciana esposa de Abraham que concibió milagrosamente a Isaac a los 90 años?',
      opts: ['Agar', 'Sara', 'Cetura', 'Milca'],
      correct: 1,
      hint: 'Dijo: "Dios me ha hecho reír, y cualquiera que lo oyere, se reirá conmigo".',
      context: 'Génesis 21:1-6'
    }
  ],
  7: [
    {
      q: '¿Cuál de las 12 tribus de Israel no recibió un territorio geográfico propio por estar consagrada al sacerdocio?',
      opts: ['Dan', 'Leví', 'Zabulón', 'Neftalí'],
      correct: 1,
      hint: 'El Señor mismo era su heredad y servían en el Tabernáculo.',
      context: 'Números 18:20'
    },
    {
      q: '¿Qué mujer fue profetisa y la única jueza de Israel que guió la victoria junto a Barac?',
      opts: ['Débora', 'Jael', 'Micaías', 'Hulda'],
      correct: 0,
      hint: 'Juzgaba a Israel sentada debajo de una palmera entre Ramá y Betel.',
      context: 'Jueces 4:4-5'
    },
    {
      q: '¿En qué isla del mar Egeo estuvo desterrado el apóstol Juan cuando recibió la revelación del Apocalipsis?',
      opts: ['Creta', 'Patmos', 'Chipre', 'Malta'],
      correct: 1,
      hint: 'Estuvo allí "por causa de la palabra de Dios y el testimonio de Jesucristo".',
      context: 'Apocalipsis 1:9'
    },
    {
      q: '¿Qué oficio manual ejercían el apóstol Pablo, Aquila y Priscila para sostenerse en su ministerio?',
      opts: ['Pescadores', 'Hacedores de tiendas', 'Alfareros', 'Curtidores'],
      correct: 1,
      hint: 'Vivió y trabajó con ellos en Corinto porque eran del mismo oficio.',
      context: 'Hechos 18:1-3'
    },
    {
      q: '¿Cómo se llamaba el criado del profeta Eliseo que fue castigado con lepra por codiciar dinero de Naamán?',
      opts: ['Giezi', 'Urías', 'Baruc', 'Natán'],
      correct: 0,
      hint: 'Salió de su presencia leproso, blanco como la nieve.',
      context: '2 Reyes 5:20-27'
    },
    {
      q: '¿Cómo se llamaba el generoso pariente de Elimelec en cuyos campos espigó Rut y con quien luego se casó?',
      opts: ['Booz', 'Quilión', 'Mahlón', 'Obed'],
      correct: 0,
      hint: 'Hombre rico e ilustre de la familia de Elimelec en Belén.',
      context: 'Rut 2 y 4'
    },
    {
      q: '¿En qué ciudad residía la viuda a quien Elías multiplicó la harina de la tinaja y el aceite de la vasija?',
      opts: ['Sarepta de Sidón', 'Jericó', 'Samaria', 'Damasco'],
      correct: 0,
      hint: 'Mencionada por Jesús en el Evangelio de Lucas al predicar en Nazaret.',
      context: '1 Reyes 17:9, Lucas 4:26'
    },
    {
      q: '¿Qué piadosa costurera de Jope abundaba en buenas obras y fue resucitada de la muerte por el apóstol Pedro?',
      opts: ['Lidia', 'Tabita (Dorcas)', 'Priscila', 'Febe'],
      correct: 1,
      hint: 'Las viudas lloraban mostrando las túnicas y los vestidos que ella hacía.',
      context: 'Hechos 9:36-42'
    }
  ],
  8: [
    {
      q: '¿Cuántos espías envió Moisés a explorar la tierra de Canaán, de los cuales solo Josué y Caleb dieron buen reporte?',
      opts: ['7 espías', '10 espías', '12 espías', '70 espías'],
      correct: 2,
      hint: 'Uno por cada tribu de los hijos de Israel.',
      context: 'Números 13:1-16'
    },
    {
      q: '¿Qué profeta contempló en visión un valle lleno de huesos secos que revivían al soplar el espíritu?',
      opts: ['Ezequiel', 'Daniel', 'Zacarías', 'Amós'],
      correct: 0,
      hint: 'Hijo de Buzi, profeta durante el exilio junto al río Quebar.',
      context: 'Ezequiel 37'
    },
    {
      q: '¿Cuál fue el nombre babilónico asignado al profeta Daniel en la corte del rey Nabucodonosor?',
      opts: ['Sadrac', 'Mesac', 'Abed-nego', 'Beltsasar'],
      correct: 3,
      hint: 'Nombre que el jefe de los eunucos le impuso en honor a una deidad caldea.',
      context: 'Daniel 1:7'
    },
    {
      q: '¿Cómo se llamaba el sumo sacerdote que presidió el juicio religioso contra Jesús antes de enviarlo a Pilato?',
      opts: ['Anás', 'Caifás', 'Gamaliel', 'Nicodemo'],
      correct: 1,
      hint: 'Profetizó que convenía que un hombre muriera por el pueblo.',
      context: 'Juan 11:49-50, Mateo 26:57'
    },
    {
      q: '¿Qué israelita tomó del anatema en Jericó escondiendo un manto babilónico y oro, trayendo derrota en Hai?',
      opts: ['Acán', 'Coré', 'Datán', 'Abiram'],
      correct: 0,
      hint: 'De la tribu de Judá, fue juzgado en el valle de Acor.',
      context: 'Josué 7'
    },
    {
      q: '¿Qué milagrosa señal en el reloj de sol del rey Acaz concedió Dios para confirmar la sanidad de Ezequías?',
      opts: ['El sol se detuvo un día', 'La sombra retrocedió diez grados', 'Hubo eclipse total', 'Apareció una estrella'],
      correct: 1,
      hint: 'Isaías clamó a Jehová e hizo volver la sombra diez grados atrás.',
      context: '2 Reyes 20:9-11'
    },
    {
      q: '¿A qué lugar acudió el rey Saúl en secreto para consultar a una mujer adivina con espíritu de adivinación?',
      opts: ['Gilgal', 'Endor', 'Betel', 'Gabaón'],
      correct: 1,
      hint: 'Dios había prohibido terminantemente la necromancia en la ley.',
      context: '1 Samuel 28:7'
    },
    {
      q: '¿Qué rey de Judá puso cantores que marchaban al frente del ejército alabando a Dios y vencieron sin pelear?',
      opts: ['Josafat', 'Asa', 'Uzías', 'Josías'],
      correct: 0,
      hint: 'Cantaban: "Glorificad a Jehová, porque su misericordia es para siempre".',
      context: '2 Crónicas 20:21-22'
    }
  ],
  9: [
    {
      q: '¿A qué piadoso rey de Judá le concedió Dios 15 años más de vida tras llorar y orar fervientemente?',
      opts: ['Ezequías', 'Josafat', 'Uzías', 'Asa'],
      correct: 0,
      hint: 'El profeta Isaías le indicó poner una masa de higos en su llaga.',
      context: '2 Reyes 20:1-6'
    },
    {
      q: '¿Cómo se llamaba el siervo del sumo sacerdote a quien Pedro le cortó la oreja derecha en Getsemaní?',
      opts: ['Barrabás', 'Malco', 'Cornelio', 'Ananías'],
      correct: 1,
      hint: 'Jesús tocó su oreja y lo sanó inmediatamente antes de su arresto.',
      context: 'Juan 18:10, Lucas 22:51'
    },
    {
      q: '¿Quién fue elegido por suertes para reemplazar a Judas Iscariote en el ministerio apostólico?',
      opts: ['Bernabé', 'Matías', 'Silas', 'Timoteo'],
      correct: 1,
      hint: 'Había acompañado a los apóstoles desde el bautismo de Juan hasta la ascensión.',
      context: 'Hechos 1:26'
    },
    {
      q: '¿A qué ciudad se dirigía Saulo de Tarso para perseguir creyentes cuando una luz celestial lo derribó?',
      opts: ['Antioquía', 'Damasco', 'Tarso', 'Cesarea'],
      correct: 1,
      hint: 'Escuchó una voz que le decía: "Saulo, Saulo, ¿por qué me persigues?".',
      context: 'Hechos 9:1-5'
    },
    {
      q: '¿Qué profeta fue decapitado en la fortaleza de Maqueronte tras el baile de la hija de Herodías?',
      opts: ['Santiago', 'Juan el Bautista', 'Zacarías', 'Esteban'],
      correct: 1,
      hint: 'Su cabeza fue entregada en un plato a la muchacha.',
      context: 'Mateo 14:6-11'
    },
    {
      q: '¿De qué pozo trajeron agua los tres valientes de David arriesgando sus vidas en medio de los filisteos?',
      opts: ['Pozo de Siquem', 'Pozo de Belén', 'Pozo de Jacob', 'Pozo de Beerseba'],
      correct: 1,
      hint: 'David rehusó beberla y la derramó como libación a Jehová por ser sangre de hombres valientes.',
      context: '2 Samuel 23:15-17'
    },
    {
      q: '¿A qué levita natural de Chipre apodaron los apóstoles con el sobrenombre de "Hijo de Consolación"?',
      opts: ['Apolos', 'Bernabé', 'Silas', 'Marcos'],
      correct: 1,
      hint: 'Vendió una heredad y trajo el precio a los pies de los apóstoles.',
      context: 'Hechos 4:36-37'
    },
    {
      q: 'En la parábola del Buen Samaritano, ¿quiénes pasaron de largo antes de que llegara el samaritano?',
      opts: ['Un publicano y un soldado', 'Un sacerdote y un levita', 'Un fariseo y un escriba', 'Dos mercaderes'],
      correct: 1,
      hint: 'Vieron al hombre herido al borde del camino y pasaron de largo.',
      context: 'Lucas 10:31-32'
    }
  ],
  10: [ // CHECKPOINT 2 (32,000 TALENTOS) 🛡️
    {
      q: '¿Cuántos capítulos tiene el libro profético de Isaías, número que coincide con el total de libros de la Biblia?',
      opts: ['52 capítulos', '66 capítulos', '70 capítulos', '150 capítulos'],
      correct: 1,
      hint: 'A menudo llamado el "Evangelio del Antiguo Testamento".',
      context: 'Libro de Isaías'
    },
    {
      q: '¿Con cuántos hombres escogidos por su forma de beber agua derrotó Gedeón al inmenso ejército madianita?',
      opts: ['300 hombres', '1,000 hombres', '7,000 hombres', '10,000 hombres'],
      correct: 0,
      hint: 'Llevaban trompetas, cántaros vacíos y teas ardiendo gritando: "¡Por la espada de Jehová y de Gedeón!"',
      context: 'Jueces 7:7'
    },
    {
      q: '¿Cómo se llamaba la leal suegra de Rut la moabita que regresó a Belén diciendo "llamadme Mara"?',
      opts: ['Noemí', 'Orfa', 'Ana', 'Elisabet'],
      correct: 0,
      hint: 'Rut le dijo: "Tu pueblo será mi pueblo, y tu Dios mi Dios".',
      context: 'Rut 1:16-20'
    },
    {
      q: '¿Qué soberbio rey de Babilonia perdió la razón y vivió como una bestia en el campo comiendo hierba durante 7 tiempos?',
      opts: ['Belsasar', 'Nabucodonosor', 'Darío', 'Ciro'],
      correct: 1,
      hint: 'Hasta que reconoció que el Altísimo tiene dominio en el reino de los hombres.',
      context: 'Daniel 4:32-34'
    },
    {
      q: '¿Quién era el judío benjamita que rehusaba arrodillarse o inclinarse ante el soberbio visir Amán?',
      opts: ['Nehemías', 'Mardoqueo', 'Esdras', 'Zorobabel'],
      correct: 1,
      hint: 'Primo que crió a la reina Ester como a su propia hija.',
      context: 'Ester 3:2'
    },
    {
      q: '¿Qué profeta recibió la orden de casarse con una mujer fornicaria llamada Gómer como símbolo de Israel?',
      opts: ['Amós', 'Oseas', 'Miqueas', 'Sofonías'],
      correct: 1,
      hint: 'Refleja el amor inquebrantable y redentor de Dios por su pueblo infiel.',
      context: 'Oseas 1-3'
    },
    {
      q: '¿Qué matrimonio de la iglesia primitiva cayó muerto por mentir al Espíritu Santo reteniendo el precio de un campo?',
      opts: ['Aquila y Priscila', 'Ananías y Safira', 'Félix y Drusila', 'Felipe y su esposa'],
      correct: 1,
      hint: 'Pedro les dijo: "No has mentido a los hombres, sino a Dios".',
      context: 'Hechos 5:1-11'
    },
    {
      q: '¿Qué pasaje profético sobre el Cordero herido leía el eunuco etíope en su carro cuando Felipe le evangelizó?',
      opts: ['Salmo 23', 'Isaías 53', 'Daniel 9', 'Miqueas 5'],
      correct: 1,
      hint: '"Como oveja a la muerte fue llevado; y como cordero mudo delante del que lo trasquila...".',
      context: 'Hechos 8:32-35, Isaías 53:7'
    }
  ],
  11: [
    {
      q: '¿Quién fue el misterioso sacerdote del Dios Altísimo y rey de Salem a quien Abraham dio los diezmos de todo?',
      opts: ['Melquisedec', 'Jetro', 'Aarón', 'Finees'],
      correct: 0,
      hint: 'Figura mesiánica mencionada en Génesis 14, Salmo 110 y Hebreos 7.',
      context: 'Génesis 14:18-20'
    },
    {
      q: '¿En qué cordillera montañosa reposó el arca de Noé al menguar las aguas del diluvio?',
      opts: ['Montes de Ararat', 'Monte Hermón', 'Monte Líbano', 'Monte Hor'],
      correct: 0,
      hint: 'Situado en la región oriental de la actual Turquía / Armenia.',
      context: 'Génesis 8:4'
    },
    {
      q: '¿Cómo se llamaba la profetisa hermana de Moisés y Aarón que danzó con pandero tras el cruce del Mar Rojo?',
      opts: ['Séfora', 'Miriam (María)', 'Débora', 'Coas'],
      correct: 1,
      hint: 'Cantó: "Cantad a Jehová, porque en extremo se ha engrandecido; ha echado en el mar al caballo y al jinete".',
      context: 'Éxodo 15:20'
    },
    {
      q: '¿Cuál de los siguientes no era uno de los tres amigos originales de Job que vinieron a consolarlo?',
      opts: ['Elifaz temanita', 'Bildad suhita', 'Zofar naamatita', 'Eliú buzita'],
      correct: 3,
      hint: 'Eliú era un joven que esperó al final para hablar por respeto a las canas de los tres ancianos.',
      context: 'Job 2:11, Job 32:2'
    },
    {
      q: '¿Cómo se llamaba el leal escriba y secretario del profeta Jeremías que escribió sus profecías en un rollo?',
      opts: ['Esdras', 'Baruc', 'Gedalias', 'Seraías'],
      correct: 1,
      hint: 'Hijo de Nerías, a quien el rey Joacim quemó el primer rollo.',
      context: 'Jeremías 36:4'
    },
    {
      q: '¿Qué sabio fariseo y doctor de la ley en el Sanedrín aconsejó no perseguir a los apóstoles diciendo que si era de Dios no prevalecerían?',
      opts: ['Nicodemo', 'Gamaliel', 'Caifás', 'Alejandro'],
      correct: 1,
      hint: 'Fue el ilustre maestro a cuyos pies fue educado Saulo de Tarso.',
      context: 'Hechos 5:34-39, Hechos 22:3'
    },
    {
      q: '¿Quién era el esclavo fugitivo por quien el apóstol Pablo escribió una carta a su amo Filemón?',
      opts: ['Onésimo', 'Tíquico', 'Erasto', 'Epafras'],
      correct: 0,
      hint: 'Pablo lo llamó: "Mi hijo Onésimo, a quien engendré en mis prisiones".',
      context: 'Filemón 10'
    },
    {
      q: '¿Qué reina extranjera viajó con un gran séquito y camellos cargados de oro y especias para comprobar la sabiduría de Salomón?',
      opts: ['Reina de Egipto', 'Reina de Sabá', 'Reina de Etiopía', 'Reina de Babilonia'],
      correct: 1,
      hint: 'Exclamó con asombro: "¡Ni la mitad se me había dicho!".',
      context: '1 Reyes 10:1-7'
    }
  ],
  12: [
    {
      q: '¿Qué libro canónico del Antiguo Testamento se caracteriza por no mencionar expresamente el nombre de "Dios"?',
      opts: ['Eclesiastés', 'Ester', 'Rut', 'Habacuc'],
      correct: 1,
      hint: 'Sin embargo, la divina providencia de Dios es el hilo conductor de toda la historia.',
      context: 'Libro de Ester'
    },
    {
      q: '¿A qué iglesia de las siete del Apocalipsis se le amonesta severamente con las palabras: "Por cuanto eres tibio, te vomitaré de mi boca"?',
      opts: ['Éfeso', 'Esmirna', 'Filadelfia', 'Laodicea'],
      correct: 3,
      hint: 'La última iglesia del mensaje profético que se cree rica y sin necesidad de nada.',
      context: 'Apocalipsis 3:14-16'
    },
    {
      q: '¿Quién fue el profeta que confrontó con valentía al rey David tras su pecado con Betsabé mediante la parábola de la corderita?',
      opts: ['Natán', 'Gad', 'Semías', 'Ahías'],
      correct: 0,
      hint: 'Le declaró con firmeza: "¡Tú eres aquel hombre!".',
      context: '2 Samuel 12:1-7'
    },
    {
      q: '¿Cuántos años duró con exactitud el cautiverio babilónico profetizado por el profeta Jeremías?',
      opts: ['40 años', '70 años', '100 años', '120 años'],
      correct: 1,
      hint: 'Daniel entendió por los libros el número de los años al leer a Jeremías.',
      context: 'Jeremías 25:11, Daniel 9:2'
    },
    {
      q: '¿Qué joven rey de Judá comenzó a reinar a los 8 años e impulsó una gran reforma tras hallar el Libro de la Ley en el Templo?',
      opts: ['Ezequías', 'Josías', 'Joás', 'Manasés'],
      correct: 1,
      hint: 'El sumo sacerdote Hilcías encontró el libro del pacto durante las reparaciones del santuario.',
      context: '2 Reyes 22'
    },
    {
      q: '¿Ante qué procurador romano razonó el apóstol Pablo sobre la justicia, el dominio propio y el juicio venidero, haciéndolo temblar?',
      opts: ['Poncio Pilato', 'Félix', 'Galo', 'Herodes Antipas'],
      correct: 1,
      hint: 'Esposo de Drusila, quien esperaba recibir dinero de Pablo para soltarlo.',
      context: 'Hechos 24:24-26'
    },
    {
      q: '¿Quién maldecía y arrojaba piedras y polvo contra el rey David mientras huía de Jerusalén por la rebelión de Absalón?',
      opts: ['Simei', 'Ahitofel', 'Ziba', 'Amasa'],
      correct: 0,
      hint: 'Hijo de Gera, de la familia de la casa de Saúl.',
      context: '2 Samuel 16:5-13'
    },
    {
      q: '¿Qué valle maldito promete Dios en el libro de Oseas transformar milagrosamente en "puerta de esperanza"?',
      opts: ['Valle de Hinom', 'Valle de Acor', 'Valle de Cedrón', 'Valle de Josafat'],
      correct: 1,
      hint: 'El lugar donde Acán fue castigado tras la toma de Jericó.',
      context: 'Oseas 2:15'
    }
  ],
  13: [
    {
      q: '¿Qué rey de Judá fue castigado instantáneamente con lepra en la frente por osar quemar incienso en el Templo?',
      opts: ['Uzías (Azarías)', 'Manasés', 'Acaz', 'Sedequías'],
      correct: 0,
      hint: 'Ochenta valientes sacerdotes se opusieron a su soberbia en el santuario.',
      context: '2 Crónicas 26:16-21'
    },
    {
      q: '¿Cómo se llamaba el profeta cuya asna habló con voz humana al ver al Ángel de Jehová con una espada desenvainada?',
      opts: ['Balaam', 'Balac', 'Micaías', 'Baruc'],
      correct: 0,
      hint: 'Hijo de Beor, contratado para maldecir a Israel en Moab.',
      context: 'Números 22:28'
    },
    {
      q: '¿En qué lengua primordial fue redactado originalmente el texto del Nuevo Testamento apostólico?',
      opts: ['Hebreo bíblico', 'Arameo antiguo', 'Griego koiné', 'Latín vulgar'],
      correct: 2,
      hint: 'El idioma universal y comercial del Mediterráneo oriental en el siglo I.',
      context: 'Historia del Manuscrito Bíblico'
    },
    {
      q: '¿Quién fue el joven misionero que se apartó de Pablo y Bernabé en Panfilia, causando más tarde una discrepancia entre ambos?',
      opts: ['Timoteo', 'Juan Marcos', 'Tito', 'Lucas'],
      correct: 1,
      hint: 'Primo de Bernabé y autor del segundo evangelio sinóptico.',
      context: 'Hechos 15:37-39'
    },
    {
      q: '¿Qué valiente profeta de Jehová fue encarcelado con "pan de aflicción y agua de angustia" por profetizar la derrota del rey Acab?',
      opts: ['Elías', 'Micaías hijo de Imla', 'Natán', 'Jehú hijo de Hanani'],
      correct: 1,
      hint: 'Dijo: "Si llegas a volver en paz, Jehová no ha hablado por mí".',
      context: '1 Reyes 22:14-28'
    },
    {
      q: '¿Qué impío rey de Judá se arrepintió con profundo clamor cuando fue llevado prisionero con garfios y grillos de bronce a Babilonia?',
      opts: ['Acaz', 'Manasés', 'Amon', 'Joacim'],
      correct: 1,
      hint: 'Dios oyó su ruego, lo perdonó y lo restituyó en su trono en Jerusalén.',
      context: '2 Crónicas 33:10-13'
    },
    {
      q: '¿Qué rey Herodes murió herido por un ángel y comido de gusanos tras aceptar ser aclamado con voz de dios y no de hombre?',
      opts: ['Herodes el Grande', 'Herodes Antipas', 'Herodes Agripa I', 'Herodes Agripa II'],
      correct: 2,
      hint: 'Había matado a espada a Santiago, hermano de Juan, y encarcelado a Pedro.',
      context: 'Hechos 12:21-23'
    },
    {
      q: '¿A qué estanque de Jerusalén, cuyo nombre hebreo se traduce como "Enviado", mandó Jesús al ciego de nacimiento a lavarse?',
      opts: ['Estanque de Betesda', 'Estanque de Siloé', 'Estanque de Salomón', 'Estanque de Gihón'],
      correct: 1,
      hint: 'Fue, se lavó, y regresó viendo ante el asombro de sus vecinos.',
      context: 'Juan 9:7'
    }
  ],
  14: [
    {
      q: '¿Qué patriarca y libertador de Israel fue sepultado por el mismo Dios en el valle de Moab, sin que nadie sepa el lugar de su tumba?',
      opts: ['Abraham', 'Moisés', 'Josué', 'Aarón'],
      correct: 1,
      hint: 'Murió en la cumbre del Pisga a los 120 años con ojos sin oscurecerse.',
      context: 'Deuteronomio 34:5-6'
    },
    {
      q: '¿Cómo se llamaba el sacerdote padre de Juan el Bautista que quedó mudo hasta la circuncisión de su hijo por dudar del ángel Gabriel?',
      opts: ['Simeón', 'Zacarías', 'Caifás', 'Gamaliel'],
      correct: 1,
      hint: 'Su esposa era Elisabet, de las hijas de Aarón.',
      context: 'Lucas 1:18-20'
    },
    {
      q: '¿Qué capitán del ejército del rey de Siria fue limpiado de su lepra tras lavarse siete veces en las aguas del río Jordán?',
      opts: ['Naamán', 'Hazael', 'Ben-hadad', 'Sisnac'],
      correct: 0,
      hint: 'Una joven sierva hebrea cautiva dio testimonio del profeta Eliseo en Samaria.',
      context: '2 Reyes 5'
    },
    {
      q: '¿Qué profeta menor exclamó en fe sublime: "Aunque la higuera no florezca, ni en las vides haya frutos... con todo, yo me alegraré en Jehová"?',
      opts: ['Habacuc', 'Miqueas', 'Sofonías', 'Nahúm'],
      correct: 0,
      hint: 'Cierra su libro declarando: "Jehová el Señor es mi fortaleza, el cual hace mis pies como de ciervas".',
      context: 'Habacuc 3:17-19'
    },
    {
      q: '¿Qué impetuoso militar fue ungido rey de Israel y marchaba furiosamente en su carro exterminando la casa de Acab y los sacerdotes de Baal?',
      opts: ['Jehú', 'Peka', 'Omri', 'Zimri'],
      correct: 0,
      hint: 'El vigía en la torre de Jezreel avisó: "El marchar es como el marchar de Jehú hijo de Nimsi, porque marcha furiosamente".',
      context: '2 Reyes 9:20'
    },
    {
      q: '¿Qué juez de Israel mató a seiscientos hombres filisteos usando únicamente una aguijada de bueyes?',
      opts: ['Samgar hijo de Anat', 'Otoniel', 'Aod', 'Jefté'],
      correct: 0,
      hint: 'Mencionado brevemente en el libro de Jueces como libertador de Israel.',
      context: 'Jueces 3:31'
    },
    {
      q: '¿Qué artífice de la tribu de Judá fue llenado del Espíritu de Dios en sabiduría e inteligencia para diseñar el Tabernáculo?',
      opts: ['Aholiab', 'Bezaleel', 'Hiram', 'Hur'],
      correct: 1,
      hint: 'Hijo de Uri, hijo de Hur, capacitado para inventar diseños en oro, plata y bronce.',
      context: 'Éxodo 31:1-5'
    },
    {
      q: '¿Qué anciana profetisa de 84 años de la tribu de Aser no se apartaba del Templo y reconoció al niño Jesús en su presentación?',
      opts: ['Hulda', 'Ana', 'Elisabet', 'Noemí'],
      correct: 1,
      hint: 'Hija de Fanuel, servía de noche y de día con ayunos y oraciones.',
      context: 'Lucas 2:36-38'
    }
  ],
  15: [ // PREGUNTA SUPREMA: 1,000,000 DE TALENTOS CELESTIALES 👑
    {
      q: '¿En qué histórica ciudad cosmopolita de Siria se llamó por primera vez "cristianos" a los discípulos de Jesús?',
      opts: ['Jerusalén', 'Alejandría', 'Antioquía', 'Roma'],
      correct: 2,
      hint: 'Bernabé y Saulo enseñaron allí a una gran congregación durante un año entero.',
      context: 'Hechos 11:26'
    },
    {
      q: '¿Qué profeta menor del Antiguo Testamento proclamó el versículo lema: "Buscad al que hace las Pléyades y el Orión, y vuelve las tinieblas en mañana"?',
      opts: ['Miqueas', 'Amós', 'Habacuc', 'Sofonías'],
      correct: 1,
      hint: 'Pastor y recogedor de higos silvestres de Tecoa.',
      context: 'Amós 5:8'
    },
    {
      q: '¿Cuántas piedras preciosas grabadas con los nombres de las tribus formaban el Pectoral del Juicio del Sumo Sacerdote?',
      opts: ['7 piedras', '10 piedras', '12 piedras', '14 piedras'],
      correct: 2,
      hint: 'Dispuestas en cuatro hileras de tres piedras cada una.',
      context: 'Éxodo 28:15-21'
    },
    {
      q: '¿En qué monte sagrado llevó Abraham a su hijo unigénito Isaac para ofrecerlo en sacrificio antes de que Dios proveyera un carnero?',
      opts: ['Monte Sinaí', 'Monte Moriah', 'Monte Gerizim', 'Monte de los Olivos'],
      correct: 1,
      hint: 'Lugar donde siglos más tarde Salomón edificó el glorioso Templo del Señor.',
      context: 'Génesis 22:2, 2 Crónicas 3:1'
    },
    {
      q: '¿De qué ciudad de Asia Menor era originaria Lidia, la vendedora de púrpura que creyó en Filipos y hospedó a Pablo?',
      opts: ['Éfeso', 'Tiatira', 'Esmirna', 'Pérgamo'],
      correct: 1,
      hint: 'Una de las siete ciudades que recibió una carta en el Apocalipsis.',
      context: 'Hechos 16:14'
    },
    {
      q: '¿Qué profeta judeocristiano tomó el cinto del apóstol Pablo y se ató pies y manos profetizando que sería arrestado en Jerusalén?',
      opts: ['Silas', 'Ágabo', 'Judas Barsabás', 'Bernabé'],
      correct: 1,
      hint: 'Profetizó también en Antioquía sobre una gran hambre en toda la tierra habitada.',
      context: 'Hechos 21:10-11, Hechos 11:28'
    },
    {
      q: '¿Cuál es la medida en estadios del perímetro cúbico de la gloriosa Nueva Jerusalén según la revelación de Apocalipsis 21?',
      opts: ['1,000 estadios', '12,000 estadios', '144,000 estadios', '70,000 estadios'],
      correct: 1,
      hint: 'Su longitud, anchura y altura son iguales.',
      context: 'Apocalipsis 21:16'
    },
    {
      q: '¿Qué seres celestiales con alas extendidas cubrían el Propiciatorio sobre el Arca del Pacto en el Lugar Santísimo?',
      opts: ['Serafines', 'Querubines de oro', 'Arcángeles de plata', 'Cuatro seres vivientes'],
      correct: 1,
      hint: 'Miraban el uno hacia el otro, con sus rostros vueltos hacia el propiciatorio.',
      context: 'Éxodo 25:18-20'
    }
  ]
};

// ==========================================
// 4. GAME STATE & MULTIPLAYER CONTROLLER
// ==========================================
class TriviaGameEngine {
  constructor() {
    this.playerCount = 1;
    this.gameMode = 'turns'; // 'turns' (individual runs) or 'coop' (shared team run)
    this.players = [
      { id: 1, name: 'JUGADOR 1', avatar: '👨‍🚀', bank: 0, lastSafeZone: 0, finalTalentos: 0, finalLevel: 1, finished: false }
    ];
    this.activePlayerIdx = 0;
    this.currentLevel = 1;
    this.currentQuestion = null;
    this.isAnswering = false;

    // Track used questions so NO question ever repeats across players in a match!
    this.usedQuestions = new Set();

    // Comodines state
    this.lifelines = {
      fifty: true,
      sage: true,
      audience: true,
      swap: true
    };

    this.cacheDOM();
    this.bindEvents();
    this.initCanvasBackground();
    this.initFullscreenHandler();
    this.renderPlayerInputs();
    this.renderPrizeLadder();
    this.initConductorSync();
  }

  cacheDOM() {
    // Screens
    this.setupScreen = document.getElementById('setup-screen');
    this.gameScreen = document.getElementById('game-screen');

    // Setup elements
    this.playerCountBtns = document.querySelectorAll('[data-player-count]');
    this.playersGrid = document.getElementById('players-input-grid');
    this.modeBtns = document.querySelectorAll('[data-game-mode]');
    this.startBtn = document.getElementById('start-trivia-btn');

    // Gameplay elements
    this.playerAvatarEl = document.getElementById('current-player-avatar');
    this.playerNameEl = document.getElementById('current-player-name');
    this.playerTurnLabelEl = document.getElementById('player-turn-label');
    this.playersTurnBadgeEl = document.getElementById('players-turn-badge');
    this.bankDisplayEl = document.getElementById('bank-talentos');
    this.qMetaEl = document.getElementById('question-meta-badge');
    this.qTextEl = document.getElementById('question-text');
    this.optionsGridEl = document.getElementById('options-grid');
    this.ladderListEl = document.getElementById('ladder-list');
    this.walkAwayBtn = document.getElementById('walk-away-btn');

    // Lifeline buttons
    this.btnFifty = document.getElementById('lifeline-fifty');
    this.btnSage = document.getElementById('lifeline-sage');
    this.btnAudience = document.getElementById('lifeline-audience');
    this.btnSwap = document.getElementById('lifeline-swap');

    // Modals
    this.modal = document.getElementById('trivia-modal');
    this.modalDialog = document.getElementById('trivia-dialog');

    // Fullscreen elements
    this.btnFullscreen = document.getElementById('toggle-fullscreen-btn');
    this.fsText = document.getElementById('fs-text');
    this.fsIcon = document.getElementById('fs-icon');
  }

  bindEvents() {
    // Player Count Selection
    this.playerCountBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSelect();
        this.playerCountBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.playerCount = parseInt(btn.getAttribute('data-player-count'), 10);
        this.renderPlayerInputs();
      });
    });

    // Game Mode Selection
    this.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSelect();
        this.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameMode = btn.getAttribute('data-game-mode');
      });
    });

    // Start Button
    this.startBtn.addEventListener('click', () => {
      sound.playSelect();
      this.collectPlayerNames();
      this.startNewGame();
    });

    // Walk away / Plantarse
    this.walkAwayBtn.addEventListener('click', () => {
      this.handleWalkAway();
    });

    // Lifelines
    this.btnFifty.addEventListener('click', () => this.useLifelineFifty());
    this.btnSage.addEventListener('click', () => this.useLifelineSage());
    this.btnAudience.addEventListener('click', () => this.useLifelineAudience());
    this.btnSwap.addEventListener('click', () => this.useLifelineSwap());
  }

  initFullscreenHandler() {
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => {
        sound.playSelect();
        this.toggleFullscreen();
      });
    }

    const updateFsStatus = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
      if (isFs) {
        document.body.classList.add('fullscreen-mode');
        if (this.fsText) this.fsText.textContent = 'SALIR';
        if (this.fsIcon) this.fsIcon.textContent = '✖';
      } else {
        document.body.classList.remove('fullscreen-mode');
        if (this.fsText) this.fsText.textContent = 'PANTALLA COMPLETA';
        if (this.fsIcon) this.fsIcon.textContent = '⛶';
      }
    };

    document.addEventListener('fullscreenchange', updateFsStatus);
    document.addEventListener('webkitfullscreenchange', updateFsStatus);
    document.addEventListener('mozfullscreenchange', updateFsStatus);
  }

  toggleFullscreen() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    if (!isFs) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log('Exit fullscreen error:', err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
  }

  renderPlayerInputs() {
    const avatars = ['👨‍🚀', '👑', '🛡️', '🕊️', '📜', '⛵', '⭐', '🔥'];
    this.playersGrid.innerHTML = '';

    for (let i = 1; i <= this.playerCount; i++) {
      const defaultName = `JUGADOR ${i}`;
      const defaultAvatar = avatars[(i - 1) % avatars.length];

      const card = document.createElement('div');
      card.className = 'player-config-card';
      card.innerHTML = `
        <div class="player-avatar-preview" id="avatar-preview-${i}">${defaultAvatar}</div>
        <div class="avatar-selector">
          ${avatars.slice(0, 5).map(av => `
            <button type="button" class="avatar-opt-btn" onclick="selectAvatar(${i}, '${av}')">${av}</button>
          `).join('')}
        </div>
        <input type="text" class="player-name-input" id="player-name-input-${i}" 
               value="${defaultName}" placeholder="${defaultName}" maxlength="14" autocomplete="off">
      `;
      this.playersGrid.appendChild(card);
    }
  }

  collectPlayerNames() {
    this.players = [];
    for (let i = 1; i <= this.playerCount; i++) {
      const nameInput = document.getElementById(`player-name-input-${i}`);
      const avatarEl = document.getElementById(`avatar-preview-${i}`);
      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim().toUpperCase() : `JUGADOR ${i}`;
      const avatar = avatarEl ? avatarEl.textContent : '👨‍🚀';
      this.players.push({
        id: i,
        name,
        avatar,
        bank: 0,
        lastSafeZone: 0,
        finalTalentos: 0,
        finalLevel: 1,
        finished: false
      });
    }
    this.activePlayerIdx = 0;
  }

  startNewGame() {
    this.activePlayerIdx = 0;
    this.currentLevel = 1;
    this.usedQuestions = new Set(); // Reset used questions for a fresh match
    this.lifelines = { fifty: true, sage: true, audience: true, swap: true };
    this.updateLifelineButtons();

    // Add zero-scroll in-game class
    document.body.classList.add('in-game');

    this.setupScreen.style.display = 'none';
    this.gameScreen.classList.add('active');

    this.loadQuestionForLevel(this.currentLevel);
    this.updateHUD();
    this.renderPrizeLadder();
    this.broadcastConductorState();
  }

  loadQuestionForLevel(level) {
    const pool = QUESTIONS_DB[level] || QUESTIONS_DB[1];
    // Filter out questions that have already been asked to any player in this session!
    let available = pool.filter(q => !this.usedQuestions.has(q.q));

    // Fallback: if all pool questions for this tier are exhausted, recycle to avoid stopping the game
    if (available.length === 0) {
      available = pool;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    this.currentQuestion = available[randomIndex];
    this.usedQuestions.add(this.currentQuestion.q);

    this.renderCurrentQuestion();
    this.renderPrizeLadder();
  }

  renderCurrentQuestion() {
    this.isAnswering = false;
    this.disabledOptions = new Set();
    const prizeObj = LADDER_PRIZES[this.currentLevel - 1];
    const letters = ['A', 'B', 'C', 'D'];

    this.qMetaEl.textContent = `PREGUNTA ${this.currentLevel} DE 15 • POR ${prizeObj.str} TALENTOS`;
    this.qTextEl.textContent = this.currentQuestion.q;

    this.optionsGridEl.innerHTML = '';
    this.currentQuestion.opts.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('data-opt-index', idx);
      btn.innerHTML = `
        <span class="option-letter">[${letters[idx]}]</span>
        <span class="option-text">${optText}</span>
      `;
      btn.addEventListener('click', () => this.handleOptionSelect(idx, btn));
      this.optionsGridEl.appendChild(btn);
    });

    this.broadcastConductorState();
  }

  handleOptionSelect(chosenIdx, btnElement) {
    if (!btnElement && this.optionsGridEl) {
      btnElement = this.optionsGridEl.querySelector(`[data-opt-index="${chosenIdx}"]`) || this.optionsGridEl.children[chosenIdx];
    }
    if (this.isAnswering) return;
    this.isAnswering = true;
    this.broadcastConductorState();

    sound.playLockAnswer();

    // Disable all options
    const allButtons = this.optionsGridEl.querySelectorAll('.option-btn');
    allButtons.forEach(b => b.disabled = true);

    // Selected orange state
    if (btnElement) btnElement.classList.add('selected');

    // Dramatic suspense delay
    setTimeout(() => {
      btnElement.classList.remove('selected');

      const isCorrect = chosenIdx === this.currentQuestion.correct;

      if (isCorrect) {
        btnElement.classList.add('correct');
        sound.playCorrect();

        const currentPrize = LADDER_PRIZES[this.currentLevel - 1];
        const currentPlayer = this.players[this.activePlayerIdx];
        currentPlayer.bank = currentPrize.amount;

        if (currentPrize.isSafe) {
          currentPlayer.lastSafeZone = currentPrize.amount;
        }

        setTimeout(() => {
          if (this.currentLevel >= 15) {
            // VICTORY! REACHED 1,000,000 TALENTOS!
            this.handlePlayerWin();
          } else {
            this.currentLevel++;
            this.loadQuestionForLevel(this.currentLevel);
            this.updateHUD();
          }
        }, 1300);

      } else {
        btnElement.classList.add('wrong');
        sound.playWrong();

        // Reveal correct answer in green
        const correctBtn = this.optionsGridEl.querySelector(`[data-opt-index="${this.currentQuestion.correct}"]`);
        if (correctBtn) correctBtn.classList.add('correct');

        setTimeout(() => {
          this.handlePlayerEliminated();
        }, 1600);
      }
    }, 1300);
  }

  updateHUD() {
    const curP = this.players[this.activePlayerIdx];
    if (this.playerAvatarEl) this.playerAvatarEl.textContent = curP.avatar;
    if (this.playerNameEl) this.playerNameEl.textContent = curP.name;
    if (this.bankDisplayEl) {
      this.bankDisplayEl.textContent = curP.bank.toLocaleString('es-ES');
    }

    if (this.playersTurnBadgeEl) {
      if (this.players.length > 1 && this.gameMode === 'turns') {
        this.playersTurnBadgeEl.style.display = 'inline-block';
        this.playersTurnBadgeEl.textContent = `JUGADOR ${this.activePlayerIdx + 1} DE ${this.players.length}`;
      } else if (this.players.length > 1 && this.gameMode === 'coop') {
        this.playersTurnBadgeEl.style.display = 'inline-block';
        this.playersTurnBadgeEl.textContent = `EQUIPO COOPERATIVO`;
      } else {
        this.playersTurnBadgeEl.style.display = 'none';
      }
    }
  }

  renderPrizeLadder() {
    this.ladderListEl.innerHTML = '';
    LADDER_PRIZES.forEach(p => {
      const li = document.createElement('li');
      li.className = 'ladder-item';
      if (p.isSafe) li.classList.add('safe-zone');
      if (p.level === this.currentLevel) li.classList.add('current');
      if (p.level < this.currentLevel) li.classList.add('cleared');

      li.innerHTML = `
        <span class="ladder-level-num">${p.level < 10 ? '0' + p.level : p.level}</span>
        <span class="ladder-prize">${p.isSafe ? '🛡️ ' : ''}${p.str}</span>
      `;
      this.ladderListEl.appendChild(li);
    });
  }

  updateLifelineButtons() {
    this.btnFifty.disabled = !this.lifelines.fifty;
    this.btnSage.disabled = !this.lifelines.sage;
    this.btnAudience.disabled = !this.lifelines.audience;
    this.btnSwap.disabled = !this.lifelines.swap;
  }

  // ==========================================
  // 5. LIFELINES (COMODINES) IMPLEMENTATION
  // ==========================================
  useLifelineFifty() {
    if (!this.lifelines.fifty || this.isAnswering) return;
    this.lifelines.fifty = false;
    sound.playLifeline();
    this.updateLifelineButtons();

    const correctIdx = this.currentQuestion.correct;
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
    
    // Pick 2 random incorrect options to eliminate
    incorrectIndices.sort(() => Math.random() - 0.5);
    const toEliminate = incorrectIndices.slice(0, 2);

    toEliminate.forEach(idx => {
      const btn = this.optionsGridEl.querySelector(`[data-opt-index="${idx}"]`);
      if (btn) btn.classList.add('eliminated');
    });

    this.disabledOptions = new Set(toEliminate);
    this.broadcastConductorState();
  }

  useLifelineSage() {
    if (!this.lifelines.sage || this.isAnswering) return;
    this.lifelines.sage = false;
    sound.playLifeline();
    this.updateLifelineButtons();

    const cur = this.currentQuestion;
    this.openModal(`
      <div class="modal-icon">📜</div>
      <h3 class="modal-title">CONSEJO DEL MAESTRO BÍBLICO</h3>
      <p class="modal-body-text">
        «Hermano en la fe, recuerda lo escrito en <strong>${cur.context}</strong>: 
        <br><br>
        <em>"${cur.hint}"</em>
        <br><br>
        ¡Ora y confía en tu discernimiento!»
      </p>
      <button class="modal-close-btn" onclick="closeTriviaModal()">ENTENDIDO</button>
    `);
  }

  useLifelineAudience() {
    if (!this.lifelines.audience || this.isAnswering) return;
    this.lifelines.audience = false;
    sound.playLifeline();
    this.updateLifelineButtons();

    const correctIdx = this.currentQuestion.correct;
    let remaining = 100;
    const correctPercent = Math.min(88, Math.max(50, 88 - (this.currentLevel * 2) + Math.floor(Math.random() * 8)));
    remaining -= correctPercent;

    const shares = [0, 0, 0, 0];
    shares[correctIdx] = correctPercent;

    const otherIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
    const part1 = Math.floor(Math.random() * (remaining * 0.6));
    const part2 = Math.floor(Math.random() * (remaining - part1));
    const part3 = remaining - part1 - part2;

    shares[otherIndices[0]] = part1;
    shares[otherIndices[1]] = part2;
    shares[otherIndices[2]] = part3;

    const letters = ['A', 'B', 'C', 'D'];

    this.openModal(`
      <div class="modal-icon">📊</div>
      <h3 class="modal-title">📊 PREGUNTA A LOS HERMANOS</h3>
      <p class="modal-body-text">Los hermanos de la iglesia han votado y este es su consejo:</p>
      <div class="poll-bars-container">
        ${letters.map((l, i) => `
          <div class="poll-bar-col">
            <span class="poll-percent-label">${shares[i]}%</span>
            <div class="poll-bar-fill" style="height: ${Math.max(6, shares[i] * 0.9)}px;"></div>
            <span class="poll-letter-label">[${l}]</span>
          </div>
        `).join('')}
      </div>
      <button class="modal-close-btn" onclick="closeTriviaModal()">VOLVER AL JUEGO</button>
    `);
  }

  useLifelineSwap() {
    if (!this.lifelines.swap || this.isAnswering) return;
    this.lifelines.swap = false;
    sound.playLifeline();
    this.updateLifelineButtons();

    const pool = QUESTIONS_DB[this.currentLevel];
    // Find question not used yet and not the current one
    let available = pool.filter(q => !this.usedQuestions.has(q.q) && q.q !== this.currentQuestion.q);
    if (available.length === 0) {
      available = pool.filter(q => q.q !== this.currentQuestion.q);
    }
    if (available.length > 0) {
      this.currentQuestion = available[Math.floor(Math.random() * available.length)];
      this.usedQuestions.add(this.currentQuestion.q);
    }
    this.renderCurrentQuestion();
  }

  // ========================================================
  // 6. MULTIPLAYER TURN TRANSITIONS & ENDGAME CONTROLLER
  // ========================================================

  handlePlayerEliminated() {
    const curP = this.players[this.activePlayerIdx];
    curP.finalTalentos = curP.lastSafeZone;
    curP.finalLevel = this.currentLevel;
    curP.finished = true;

    // Check if there are other players whose turn hasn't happened yet
    if (this.gameMode === 'turns' && this.activePlayerIdx < this.players.length - 1) {
      const nextP = this.players[this.activePlayerIdx + 1];
      this.openModal(`
        <div class="modal-icon">💀</div>
        <h3 class="modal-title" style="color:var(--color-magenta);">TURNO DE ${curP.name} FINALIZADO</h3>
        <p class="modal-body-text">
          Respuesta incorrecta. ${curP.name} asegura su Zona Segura:
          <br><br>
          <span style="font-family:var(--font-crt); font-size:1.8rem; color:var(--color-gold);">
            ${curP.finalTalentos.toLocaleString('es-ES')} TALENTOS
          </span>
          <br><br>
          ¡Prepárate! El siguiente en jugar es:
          <br>
          <strong style="color:var(--color-cyan); font-size:1.1rem; display:inline-block; margin-top:0.4rem;">
            ${nextP.avatar} ${nextP.name}
          </strong>
        </p>
        <button class="modal-close-btn" onclick="advanceToNextPlayerTurn()">
          CONTINUAR TURNO DE ${nextP.name} ►
        </button>
      `);
    } else {
      // Last player or solo/coop finished! Show final results!
      this.showFinalPodium();
    }
  }

  handleWalkAway() {
    if (this.isAnswering) return;
    const curP = this.players[this.activePlayerIdx];
    curP.finalTalentos = curP.bank;
    curP.finalLevel = this.currentLevel;
    curP.finished = true;
    sound.playFanfare();

    if (this.gameMode === 'turns' && this.activePlayerIdx < this.players.length - 1) {
      const nextP = this.players[this.activePlayerIdx + 1];
      this.openModal(`
        <div class="modal-icon">💰</div>
        <h3 class="modal-title" style="color:var(--color-gold);">¡${curP.name} SE HA PLANTADO!</h3>
        <p class="modal-body-text">
          Decidió asegurar sus talentos acumulados:
          <br><br>
          <span style="font-family:var(--font-crt); font-size:1.8rem; color:var(--color-green);">
            ${curP.finalTalentos.toLocaleString('es-ES')} TALENTOS
          </span>
          <br><br>
          ¡Es momento del siguiente desafiante!:
          <br>
          <strong style="color:var(--color-cyan); font-size:1.1rem; display:inline-block; margin-top:0.4rem;">
            ${nextP.avatar} ${nextP.name}
          </strong>
        </p>
        <button class="modal-close-btn" onclick="advanceToNextPlayerTurn()">
          CONTINUAR TURNO DE ${nextP.name} ►
        </button>
      `);
    } else {
      this.showFinalPodium();
    }
  }

  handlePlayerWin() {
    sound.playFanfare();
    const curP = this.players[this.activePlayerIdx];
    curP.finalTalentos = 1000000;
    curP.finalLevel = 15;
    curP.finished = true;

    if (this.gameMode === 'turns' && this.activePlayerIdx < this.players.length - 1) {
      const nextP = this.players[this.activePlayerIdx + 1];
      this.openModal(`
        <div class="modal-icon">👑</div>
        <h3 class="modal-title" style="color:var(--color-gold);">¡${curP.name} CONQUISTÓ EL MILLÓN!</h3>
        <p class="modal-body-text">
          ¡Increíble! Logró alcanzar los:
          <br><br>
          <span style="font-family:var(--font-crt); font-size:2rem; color:var(--color-gold);">
            1,000,000 DE TALENTOS
          </span>
          <br><br>
          Veamos si el siguiente jugador puede igualar esta hazaña:
          <br>
          <strong style="color:var(--color-cyan); font-size:1.1rem; display:inline-block; margin-top:0.4rem;">
            ${nextP.avatar} ${nextP.name}
          </strong>
        </p>
        <button class="modal-close-btn" onclick="advanceToNextPlayerTurn()">
          TURNO DE ${nextP.name} ►
        </button>
      `);
    } else {
      this.showFinalPodium();
    }
  }

  startNextPlayerTurn() {
    this.activePlayerIdx++;
    this.currentLevel = 1;
    this.lifelines = { fifty: true, sage: true, audience: true, swap: true };
    this.updateLifelineButtons();

    // Load question for Level 1 that has NOT been answered by Player 1 or any other player!
    this.loadQuestionForLevel(1);
    this.updateHUD();
    this.renderPrizeLadder();
    closeTriviaModal();
  }

  showFinalPodium() {
    sound.playFanfare();

    // Sort players by talentos descending
    const ranked = [...this.players].sort((a, b) => {
      if (b.finalTalentos !== a.finalTalentos) return b.finalTalentos - a.finalTalentos;
      return b.finalLevel - a.finalLevel;
    });

    const champion = ranked[0];
    const isMultiplayer = this.players.length > 1;

    let podiumRows = '';
    const medals = ['🥇 1°', '🥈 2°', '🥉 3°', '4°'];

    ranked.forEach((p, idx) => {
      podiumRows += `
        <tr>
          <td class="podium-rank-${idx + 1}">${medals[idx] || (idx + 1) + '°'}</td>
          <td style="color:#fff;">${p.avatar} ${p.name}</td>
          <td style="color:var(--color-gold);">${p.finalTalentos.toLocaleString('es-ES')}</td>
          <td style="color:var(--color-cyan); font-size:0.75rem;">Nivel ${p.finalLevel}</td>
        </tr>
      `;
    });

    this.openModal(`
      <div class="modal-icon">🏆</div>
      <h3 class="modal-title" style="color:var(--color-gold);">
        ${isMultiplayer ? '¡RESULTADOS DE LA PARTIDA!' : '¡PARTIDA FINALIZADA!'}
      </h3>
      <p class="modal-body-text">
        ${isMultiplayer ? `¡El campeón de la trivia es <strong>${champion.avatar} ${champion.name}</strong> con ${champion.finalTalentos.toLocaleString('es-ES')} talentos!` : `Has concluido tu recorrido bíblico con ${champion.finalTalentos.toLocaleString('es-ES')} talentos.`}
      </p>

      <table class="podium-table">
        <thead>
          <tr>
            <th>POS</th>
            <th>JUGADOR</th>
            <th>TALENTOS</th>
            <th>NIVEL</th>
          </tr>
        </thead>
        <tbody>
          ${podiumRows}
        </tbody>
      </table>

      <div style="display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
        <button class="modal-close-btn" onclick="restartTriviaGame()">NUEVA PARTIDA</button>
        <a href="index.html" class="modal-close-btn" style="text-decoration:none; background:#251347; color:#00f5ff; border-color:#00f5ff;">IR AL ARCADE</a>
      </div>
    `);
  }

  openModal(htmlContent) {
    if (this.modalDialog) {
      this.modalDialog.innerHTML = htmlContent;
    }
    if (this.modal) {
      this.modal.classList.add('active');
    }
    this.broadcastConductorState();
  }

  // ==========================================
  // 6. TRIVIA CONDUCTOR REMOTE SYNC (SUPABASE)
  // ==========================================
  initConductorSync() {
    this.conductorRoomId = 'TRV-' + Math.floor(10 + Math.random() * 90);
    this.disabledOptions = new Set();
    this.conductorChannel = null;
    this.conductorLocalBc = null;

    // 1. Supabase Realtime Broadcast
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY) {
      try {
        const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
        this.conductorChannel = client.channel(`orion_trivia_${this.conductorRoomId}`, {
          config: { broadcast: { ack: false, self: false } }
        });

        this.conductorChannel.on('broadcast', { event: 'conductor_connected' }, () => {
          sound.playFanfare();
          this.updateConductorModalConnected();
          this.showConductorToast('🟢 ¡MANDO DEL CONDUCTOR VINCULADO!');
          this.broadcastConductorState();
        });

        this.conductorChannel.on('broadcast', { event: 'conductor_action' }, (res) => {
          const payload = res?.payload?.payload || res?.payload || res;
          if (payload) this.handleConductorAction(payload);
        });

        this.conductorChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[Trivia Engine] Conductor channel ready: orion_trivia_${this.conductorRoomId}`);
          }
        });
      } catch (e) {
        console.warn('Error starting Supabase conductor channel:', e);
      }
    }

    // 2. BroadcastChannel fallback for same-device testing
    try {
      this.conductorLocalBc = new BroadcastChannel(`orion_trivia_${this.conductorRoomId}`);
      this.conductorLocalBc.onmessage = (e) => {
        if (e.data && e.data.event === 'conductor_action') {
          const payload = e.data.payload?.payload || e.data.payload || e.data;
          this.handleConductorAction(payload);
        } else if (e.data && e.data.event === 'conductor_connected') {
          sound.playFanfare();
          this.updateConductorModalConnected();
          this.showConductorToast('🟢 ¡MANDO DEL CONDUCTOR VINCULADO!');
          this.broadcastConductorState();
        }
      };
    } catch (e) {}

    // Modal button listener
    const btnOpen = document.getElementById('btn-open-conductor-modal');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        sound.playSelect();
        this.openConductorModal();
      });
    }
  }

  handleConductorAction(payload) {
    const { action, optionIndex, lifelineType } = payload || {};
    if (!action) return;

    if (action === 'start_game') {
      if (this.setupScreen && this.setupScreen.style.display !== 'none') {
        sound.playSelect();
        this.collectPlayerNames();
        this.startNewGame();
        this.showConductorToast('🎙️ Conductor inició la Trivia');
      }
      return;
    }

    if (action === 'select_option') {
      if (this.isAnswering) return;
      const letters = ['A', 'B', 'C', 'D'];
      const chosenLetter = letters[optionIndex] || `Opción ${optionIndex + 1}`;
      this.showConductorToast(`📱 Conductor marcó opción [${chosenLetter}]`);

      const buttons = this.optionsGridEl.querySelectorAll('.option-btn');
      const targetBtn = buttons[optionIndex];
      this.handleOptionSelect(optionIndex, targetBtn);
      return;
    }

    if (action === 'lifeline') {
      const lifelineNames = {
        fifty: '50:50',
        sage: 'Consejo',
        audience: 'Pregunta a los Hermanos',
        swap: 'Cambiar Pregunta'
      };
      this.showConductorToast(`📱 Conductor usó comodín: ${lifelineNames[lifelineType] || lifelineType}`);
      if (lifelineType === 'fifty') this.useLifelineFifty();
      else if (lifelineType === 'sage') this.useLifelineSage();
      else if (lifelineType === 'audience') this.useLifelineAudience();
      else if (lifelineType === 'swap') this.useLifelineSwap();
      return;
    }

    if (action === 'walk_away') {
      this.showConductorToast('📱 Conductor activó: RETIRARSE');
      this.handleWalkAway();
      return;
    }

    if (action === 'modal_continue') {
      const modal = document.getElementById('trivia-modal');
      if (modal && modal.classList.contains('active')) {
        const dialog = document.getElementById('trivia-dialog');
        const nextBtn = dialog?.querySelector('button[onclick*="advanceToNextPlayerTurn"]');
        if (nextBtn) {
          window.advanceToNextPlayerTurn();
        } else {
          window.closeTriviaModal();
        }
        this.broadcastConductorState();
      }
    }
  }

  broadcastConductorState() {
    const isSetup = this.setupScreen && this.setupScreen.style.display !== 'none';
    const curP = this.players ? this.players[this.activePlayerIdx] : null;
    const prizeObj = LADDER_PRIZES[this.currentLevel - 1] || LADDER_PRIZES[0];

    const state = {
      phase: isSetup ? 'setup' : 'playing',
      player: curP ? {
        name: curP.name,
        avatar: curP.avatar,
        bank: curP.bank,
        lastSafeZone: curP.lastSafeZone,
        index: this.activePlayerIdx,
        total: this.players.length
      } : null,
      level: this.currentLevel,
      maxLevel: 15,
      prize: prizeObj,
      question: this.currentQuestion ? {
        text: this.currentQuestion.q,
        options: this.currentQuestion.opts,
        correct: this.currentQuestion.correct,
        hint: this.currentQuestion.hint
      } : null,
      lifelines: this.lifelines,
      disabledOptions: Array.from(this.disabledOptions || []),
      isAnswering: Boolean(this.isAnswering),
      modalActive: document.getElementById('trivia-modal')?.classList.contains('active') || false
    };

    if (this.conductorChannel) {
      this.conductorChannel.send({
        type: 'broadcast',
        event: 'trivia_state',
        payload: state
      }).catch?.(() => {});
    }

    if (this.conductorLocalBc) {
      this.conductorLocalBc.postMessage({ event: 'trivia_state', payload: state });
    }
  }

  showConductorToast(msg) {
    const toast = document.getElementById('conductor-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'flex';
    clearTimeout(this.conductorToastTimer);
    this.conductorToastTimer = setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, 2800);
  }

  openConductorModal() {
    const modal = document.getElementById('conductor-modal');
    const codeEl = document.getElementById('conductor-room-code');
    const qrImg = document.getElementById('conductor-qr-img');
    const directLink = document.getElementById('conductor-direct-link');

    if (!modal) return;
    if (codeEl) codeEl.textContent = this.conductorRoomId;

    let baseUrl = window.location.href.split('#')[0].split('?')[0];
    if (baseUrl.endsWith('trivia.html')) {
      baseUrl = baseUrl.replace('trivia.html', 'conductor.html');
    } else if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl + 'conductor.html';
    } else {
      baseUrl = baseUrl + '/conductor.html';
    }

    const conductorUrl = `${baseUrl}?room=${this.conductorRoomId}`;

    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=2&data=${encodeURIComponent(conductorUrl)}`;
    }
    if (directLink) {
      directLink.href = conductorUrl;
    }

    modal.classList.add('active');
  }

  closeConductorModal() {
    const modal = document.getElementById('conductor-modal');
    if (modal) modal.classList.remove('active');
  }

  updateConductorModalConnected() {
    const statusEl = document.getElementById('conductor-conn-status');
    if (statusEl) {
      statusEl.innerHTML = '🟢 ¡CONDUCTOR CONECTADO! Listo para dirigir.';
      statusEl.style.color = '#00ff66';
    }
  }

  initCanvasBackground() {
    const canvas = document.getElementById('trivia-space-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.2 + Math.random() * 0.4,
        size: Math.random() < 0.8 ? 2 : 3,
        alpha: Math.random()
      });
    }

    function animate() {
      ctx.fillStyle = '#070312';
      ctx.fillRect(0, 0, width, height);

      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > height) s.y = 0;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.002 + s.x) * 0.3;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
      });
      ctx.globalAlpha = 1.0;

      requestAnimationFrame(animate);
    }
    animate();
  }
}

// Global functions attached to window for event attributes
window.selectAvatar = function(playerNum, avatar) {
  const el = document.getElementById(`avatar-preview-${playerNum}`);
  if (el) el.textContent = avatar;
  sound.playSelect();
};

window.closeTriviaModal = function() {
  const m = document.getElementById('trivia-modal');
  if (m) m.classList.remove('active');
  if (gameInstance) gameInstance.broadcastConductorState();
};

window.openConductorModal = function() {
  if (gameInstance) gameInstance.openConductorModal();
};

window.closeConductorModal = function() {
  const modal = document.getElementById('conductor-modal');
  if (modal) modal.classList.remove('active');
};

let gameInstance = null;

window.advanceToNextPlayerTurn = function() {
  if (gameInstance) {
    sound.playSelect();
    gameInstance.startNextPlayerTurn();
  }
};

window.restartTriviaGame = function() {
  window.closeTriviaModal();
  document.body.classList.remove('in-game');
  const setup = document.getElementById('setup-screen');
  const game = document.getElementById('game-screen');
  if (setup) setup.style.display = 'block';
  if (game) game.classList.remove('active');
  if (gameInstance) {
    gameInstance.currentLevel = 1;
    gameInstance.activePlayerIdx = 0;
    gameInstance.usedQuestions = new Set();
  }
};

// Start on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  gameInstance = new TriviaGameEngine();
});
