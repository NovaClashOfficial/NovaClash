/* =====================================================
   CONFIGURACIÓN DE LA SALA DE LA GRAN FINAL
   Cambiá aquí nombres, códigos, mapas y opciones.
===================================================== */

/* =====================================================
   FINALISTAS Y CÓDIGOS
===================================================== */

export const jugadoresFinalistas = {
  "BC-CODIGO-1": {
    nombre: "Jugador Black Cat 1",
    equipo: "Black Cat",
    equipoId: "black-cat"
  },

  "BC-CODIGO-2": {
    nombre: "Jugador Black Cat 2",
    equipo: "Black Cat",
    equipoId: "black-cat"
  },

  "BC-CODIGO-3": {
    nombre: "Jugador Black Cat 3",
    equipo: "Black Cat",
    equipoId: "black-cat"
  },

  "C8-CODIGO-1": {
    nombre: "Jugador Community 8 1",
    equipo: "Community 8",
    equipoId: "community-8"
  },

  "C8-CODIGO-2": {
    nombre: "Jugador Community 8 2",
    equipo: "Community 8",
    equipoId: "community-8"
  },

  "C8-CODIGO-3": {
    nombre: "Jugador Community 8 3",
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
    "Mapa Atrapagemas 1",
    "Mapa Atrapagemas 2",
    "Mapa Atrapagemas 3",
    "Mapa Atrapagemas 4",
    "Mapa Atrapagemas 5",
    "Mapa Atrapagemas 6",
    "Mapa Atrapagemas 7"
  ],

  "balon-brawl": [
    "Mapa Balón Brawl 1",
    "Mapa Balón Brawl 2",
    "Mapa Balón Brawl 3",
    "Mapa Balón Brawl 4",
    "Mapa Balón Brawl 5",
    "Mapa Balón Brawl 6",
    "Mapa Balón Brawl 7"
  ],

  atraco: [
    "Mapa Atraco 1",
    "Mapa Atraco 2",
    "Mapa Atraco 3",
    "Mapa Atraco 4",
    "Mapa Atraco 5",
    "Mapa Atraco 6",
    "Mapa Atraco 7"
  ],

  "zona-restringida": [
    "Mapa Zona Restringida 1",
    "Mapa Zona Restringida 2",
    "Mapa Zona Restringida 3",
    "Mapa Zona Restringida 4",
    "Mapa Zona Restringida 5",
    "Mapa Zona Restringida 6",
    "Mapa Zona Restringida 7"
  ],

  noqueo: [
    "Mapa Noqueo 1",
    "Mapa Noqueo 2",
    "Mapa Noqueo 3",
    "Mapa Noqueo 4",
    "Mapa Noqueo 5",
    "Mapa Noqueo 6",
    "Mapa Noqueo 7"
  ],

  "caza-estelar": [
    "Mapa Caza Estelar 1",
    "Mapa Caza Estelar 2",
    "Mapa Caza Estelar 3",
    "Mapa Caza Estelar 4",
    "Mapa Caza Estelar 5",
    "Mapa Caza Estelar 6",
    "Mapa Caza Estelar 7"
  ],

  "hockey-brawl": [
    "Mapa Hockey Brawl 1",
    "Mapa Hockey Brawl 2",
    "Mapa Hockey Brawl 3",
    "Mapa Hockey Brawl 4",
    "Mapa Hockey Brawl 5",
    "Mapa Hockey Brawl 6",
    "Mapa Hockey Brawl 7"
  ],

  brawloncesto: [
    "Mapa Brawloncesto 1",
    "Mapa Brawloncesto 2",
    "Mapa Brawloncesto 3",
    "Mapa Brawloncesto 4",
    "Mapa Brawloncesto 5",
    "Mapa Brawloncesto 6",
    "Mapa Brawloncesto 7"
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
  "Brawler con buffie 1",
  "Brawler con buffie 2",
  "Brawler con buffie 3",
  "Brawler con buffie 4",
  "Brawler con buffie 5",
  "Brawler con buffie 6",
  "Brawler con buffie 7",
  "Brawler con buffie 8",
  "Brawler con buffie 9",
  "Brawler con buffie 10"
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
