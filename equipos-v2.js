console.log("EQUIPOS NOVA CLASH V2");

export const configuracionV2 = {

  faseActiva: "grupos",

  prediccionesAbiertas: true,

  puntos: {
    ganador: 3,
    marcador: 2,
    estelar: 1
  }

};
/* ==========================================
   EQUIPOS
========================================== */

export const equiposV2 = [

  {
    id: "equipo-01",
    nombre: "Equipo 1",

    jugadores: [
      "Jugador 1",
      "Jugador 2",
      "Jugador 3"
    ],

    grupo: "A"
  },

  {
    id: "equipo-02",
    nombre: "Equipo 2",

    jugadores: [
      "Jugador 1",
      "Jugador 2",
      "Jugador 3"
    ],

    grupo: "A"
  },

  {
    id: "equipo-03",
    nombre: "Equipo 3",

    jugadores: [
      "Jugador 1",
      "Jugador 2",
      "Jugador 3"
    ],

    grupo: "A"
  },

  {
    id: "equipo-04",
    nombre: "Equipo 4",

    jugadores: [
      "Jugador 1",
      "Jugador 2",
      "Jugador 3"
    ],

    grupo: "A"
  ]

];

/* ==========================================
   ENFRENTAMIENTOS
========================================== */

export const enfrentamientosV2 = {

  grupos: [

    {
      id: "grupos-01",
      equipo1: "equipo-01",
      equipo2: "equipo-02"
    },

    {
      id: "grupos-02",
      equipo1: "equipo-03",
      equipo2: "equipo-04"
    }

  ],

  octavos: [],

  cuartos: [],

  semifinales: [],

  final: []

};
