/* =====================================================
   CONFIGURACIÓN DE LA SALA DE LA GRAN FINAL
   Cambiá aquí nombres, códigos, mapas y opciones.
===================================================== */

/* =====================================================
   FINALISTAS Y CÓDIGOS
===================================================== */

export const jugadoresFinalistas = {
  "BC-J908O": {
    nombre: "Jairo",
    equipo: "Black Cat",
    equipoId: "black-cat"
  },

  "BC-A908X": {
    nombre: "Alex",
    equipo: "Black Cat",
    equipoId: "black-cat"
  },

  "BC-D908N": {
    nombre: "Dairen",
    equipo: "Black Cat",
    equipoId: "black-cat"
  },

  "C8-R90919G": {
    nombre: "Nestor",
    equipo: "Community 8",
    equipoId: "community-8"
  },

  "C8-K90819O": {
    nombre: "Kyro",
    equipo: "Community 8",
    equipoId: "community-8"
  },

  "C8-J90919O": {
    nombre: "Jaramillo",
    equipo: "Community 8",
    equipoId: "community-8"
  }
};

/* =====================================================
   MODOS

   Los ID no conviene cambiarlos después.
   Podés cambiar libremente el nombre visible.
===================================================== */

export const modosFinal = [
  {
    id: "atrapagemas",
    nombre: "Atrapagemas",
    icono: "💎",
    habilitadoParaDesempate: true
  },

  {
    id: "balon-brawl",
    nombre: "Balón Brawl",
    icono: "⚽",
    habilitadoParaDesempate: false
  },

  {
    id: "atraco",
    nombre: "Atraco",
    icono: "💰",
    habilitadoParaDesempate: false
  },

  {
    id: "zona-restringida",
    nombre: "Zona Restringida",
    icono: "🟢",
    habilitadoParaDesempate: false
  },

  {
    id: "noqueo",
    nombre: "Noqueo",
    icono: "💥",
    habilitadoParaDesempate: true
  },

  {
    id: "caza-estelar",
    nombre: "Caza Estelar",
    icono: "⭐",
    habilitadoParaDesempate: true
  },

  {
    id: "hockey-brawl",
    nombre: "Hockey Brawl",
    icono: "🏒",
    habilitadoParaDesempate: false
  },

  {
    id: "brawloncesto",
    nombre: "Brawloncesto",
    icono: "🏀",
    habilitadoParaDesempate: false
  }
];

/* =====================================================
   MAPAS POR MODO

   Reemplazá "Mapa 1", "Mapa 2", etc. por los nombres
   reales. Mantené siete opciones en cada modo.
===================================================== */

export const mapasPorModo = {
  atrapagemas: [
    "Mina Rocosa",
    "Hiedra Venenosa",
    "Fuerte de Gemas",
    "Arcade de Cristal",
    "Brrrum Brrrum",
    "Restaurantes Locales",
    "Cueva Subterranea"
  ],

  "balon-brawl": [
    "Pinball",
    "Palco Central",
    "SuperPlaya",
    "Campos Furtivos",
    "Campo de Hierva",
    "Triple Drible",
    "Estadio Brawl"
  ],

  atraco: [
    "Cañon Explosivo",
    "Refugio",
    "Maldad Sin Fin",
    "Aguas Turbulentas",
    "Patata Caliente",
    "Neumaticos Maniaticos",
    "Caverna Angular"
  ],

  "zona-restringida": [
    "Campo Abierto",
    "Duelo de Escarabajos",
    "Zona Abierta",
    "Pista Ardiente",
    "Al Limite",
    "Abracadabra",
    "Estrategias Paralelas"
  ],

  noqueo: [
    "Roca de Belle",
    "Barranco del B.de oro",
    "Fenix en Llamas",
    "Hasta el fondo",
    "A la interperie",
    "Nuevo Horizontes",
    "Konnakol"
  ],

  "caza-estelar": [
    "Tiroteo Estelar",
    "Sequia Sanguinaria",
    "Escondite",
    "Ninguna Excusa",
    "Crimen Organizado",
    "Impacto Inminente",
    "Sandias Frescas"
  ],

  "hockey-brawl": [
    "Reves Resbaladizo",
    "Salto Sincronizado",
    "Caja Confidencial",
    "Hiperespacio",
    "Centro congelado",
    "Jugada Sigilosa",
    "Arabesco"
  ],

  brawloncesto: [
    "Alley Oop",
    "Tres Botes",
    "Acaparador",
    "Pase",
    "Cambio",
    "Pase de Vuelta",
    "Hundida"
  ]
};

/* =====================================================
   CONFIGURACIÓN DE DESCARTES
===================================================== */

export const configuracionModos = {
  cantidadADescartar: 3,

  mensajeGrupal:
    "Esta es una decisión grupal. La primera elección confirmada se aplicará a todo tu equipo."
};

/* =====================================================
   REGLAS INDIVIDUALES
===================================================== */

export const reglasFinal = [
  {
    id: "toxicidad",
    nombre: "Toxicidad",
    descripcion:
      "Elegí qué elementos de comunicación estarán permitidos.",

    opciones: [
      {
        valor: "permitir-todo",
        texto: "Permitir todo"
      },

      {
        valor: "solo-sprays",
        texto: "Solo sprays"
      },

      {
        valor: "solo-emotes",
        texto: "Solo emotes"
      },

      {
        valor: "ninguno",
        texto: "Ninguna de las dos"
      }
    ]
  },

  {
    id: "tiempo-espera",
    nombre: "Tiempo de espera",
    descripcion:
      "Tiempo máximo permitido antes de iniciar o reanudar.",

    opciones: [
      {
        valor: "10",
        texto: "10 minutos (por defecto)"
      },

      {
        valor: "15",
        texto: "15 minutos"
      },

      {
        valor: "5",
        texto: "5 minutos"
      }
    ]
  }
];

/* =====================================================
   BRAWLERS CON BUFFIES

   Reemplazá cada nombre por un brawler real.
===================================================== */

export const brawlersConBuffies = [
  "Meg",
  "Max",
  "Surge",
  "Brock",
  "8 Bit",
  "Rico",
  "Edgar",
  "Collete",
  "Griff",
  "Bo",
  "Nita",
  "Leon",
  "Emz",
  "Frank",
  "Mortis",
  "Rico",
  "Shelly",
  "Colt",
  "Spike",
  "Bibi",
  "Crow",
  "Bull"
];

export const opcionesBuffies = [
  {
    valor: "permitir-todos",
    texto: "Permitir todos",
    cantidadBloqueos: 0
  },

  {
    valor: "bloquear-5",
    texto: "Bloquear 5",
    cantidadBloqueos: 5
  },

  {
    valor: "bloquear-3",
    texto: "Bloquear 3",
    cantidadBloqueos: 3
  },

  {
    valor: "no-permitir-ninguno",
    texto: "No permitir ninguno",
    cantidadBloqueos: "todos"
  }
];

/* =====================================================
   BRAWLERS GENERALES

   Podés agregar o quitar nombres libremente.
===================================================== */

export const brawlersGenerales = [
  "Brawler general 1",
  "Brawler general 2",
  "Brawler general 3",
  "Brawler general 4",
  "Brawler general 5",
  "Brawler general 6",
  "Brawler general 7",
  "Brawler general 8",
  "Brawler general 9",
  "Brawler general 10",
  "Brawler general 11",
  "Brawler general 12",
  "Brawler general 13",
  "Brawler general 14",
  "Brawler general 15",
  "Brawler general 16",
  "Brawler general 17",
  "Brawler general 18",
  "Brawler general 19",
  "Brawler general 20"
];

export const opcionesBrawlersGenerales = [
  {
    valor: "permitir-todos",
    texto: "Permitir todos",
    cantidadBloqueos: 0
  },

  {
    valor: "bloquear-5",
    texto: "Bloquear 5",
    cantidadBloqueos: 5
  },

  {
    valor: "bloquear-3",
    texto: "Bloquear 3",
    cantidadBloqueos: 3
  }
];

/* =====================================================
   ENCUESTA INDIVIDUAL

   Podés modificar las preguntas sin cambiar la lógica,
   manteniendo un ID único en cada una.
===================================================== */

export const preguntasEncuesta = [
  {
    id: "experiencia",
    tipo: "texto",
    pregunta:
      "¿Qué te pareció la experiencia de Nova Clash, primera edición?",

    placeholder:
      "Escribí tu opinión sobre el torneo..."
  },

  {
    id: "pagina",
    tipo: "texto",
    pregunta:
      "¿Qué opinás sobre la página de predicciones y la página de finalistas?",

    placeholder:
      "Contanos qué te gustó o qué mejorarías..."
  },

  {
    id: "segunda-edicion",
    tipo: "texto",
    pregunta:
      "¿Regresarías para la segunda edición?",

    placeholder:
      "Explicá tu respuesta..."
  },

  {
    id: "equipo-favorito",
    tipo: "texto",
    pregunta:
      "¿Cuál fue tu equipo favorito, excluyendo el tuyo?",

    placeholder:
      "Nombre del equipo y motivo..."
  },

  {
    id: "funcion-v2",
    tipo: "texto",
    pregunta:
      "¿Qué función agregarías a la versión 2 de la página de predicciones?",

    placeholder:
      "Proponé una función nueva..."
  },

  {
    id: "organizacion",
    tipo: "estrellas",
    pregunta:
      "¿Cómo calificarías la organización de Nova Clash?",

    opciones: [1, 2, 3, 4, 5]
  },

  {
    id: "dificultad",
    tipo: "opciones",
    pregunta:
      "¿Cómo sentiste el nivel del torneo?",

    opciones: [
      {
        valor: "muy-facil",
        texto: "Muy fácil"
      },

      {
        valor: "facil",
        texto: "Fácil"
      },

      {
        valor: "normal",
        texto: "Normal"
      },

      {
        valor: "dificil",
        texto: "Difícil"
      },

      {
        valor: "muy-dificil",
        texto: "Muy difícil"
      }
    ]
  }
];

/* =====================================================
   PASOS DE LA PÁGINA
===================================================== */

export const pasosSalaFinal = [
  {
    numero: 1,
    id: "modos",
    titulo: "Modos a descartar",
    tipo: "grupal"
  },

  {
    numero: 2,
    id: "mapas",
    titulo: "Elección de mapas",
    tipo: "grupal"
  },

  {
    numero: 3,
    id: "desempate",
    titulo: "Modo y mapa de desempate",
    tipo: "grupal"
  },

  {
    numero: 4,
    id: "reglas",
    titulo: "Reglas de la final",
    tipo: "individual"
  },

  {
    numero: 5,
    id: "buffies",
    titulo: "Brawlers con buffies",
    tipo: "grupal"
  },

  {
    numero: 6,
    id: "brawlers-generales",
    titulo: "Brawlers generales",
    tipo: "individual"
  },

  {
    numero: 7,
    id: "encuesta",
    titulo: "Experiencia Nova Clash",
    tipo: "individual"
  }
];
