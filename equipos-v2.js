console.log("🏆 NOVA CLASH II - EQUIPOS V2");

/* ===========================================
   CONFIGURACIÓN DEL TORNEO
=========================================== */

export const configuracionV2 = {

    temporada: "Nova Clash II",

    faseActiva: "grupos",

    prediccionesAbiertas: true,

    equiposQueClasifican: 4,

    puntosVictoria: 3,

    puntosDerrota: 0,

    criterioDesempate: [
        "puntos",
        "diferencia",
        "victorias"
    ]

};

/* ===========================================
   EQUIPOS
=========================================== */

export const equiposV2 = [

/* ---------- GRUPO A ---------- */

{
id:"A1",
nombre:"Black Cat",
grupo:"A",
jugadores:["Jairo","Demi","Alex"]
},

{
id:"A2",
nombre:"Equipo A2",
grupo:"A",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"A3",
nombre:"Equipo A3",
grupo:"A",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"A4",
nombre:"Equipo A4",
grupo:"A",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"A5",
nombre:"Equipo A5",
grupo:"A",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"A6",
nombre:"Equipo A6",
grupo:"A",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

/* ---------- GRUPO B ---------- */

{
id:"B1",
nombre:"Community 8",
grupo:"B",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"B2",
nombre:"Equipo B2",
grupo:"B",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"B3",
nombre:"Equipo B3",
grupo:"B",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"B4",
nombre:"Equipo B4",
grupo:"B",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"B5",
nombre:"Equipo B5",
grupo:"B",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"B6",
nombre:"Equipo B6",
grupo:"B",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

/* ---------- GRUPO C ---------- */

{
id:"C1",
nombre:"Equipo C1",
grupo:"C",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"C2",
nombre:"Equipo C2",
grupo:"C",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"C3",
nombre:"Equipo C3",
grupo:"C",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"C4",
nombre:"Equipo C4",
grupo:"C",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"C5",
nombre:"Equipo C5",
grupo:"C",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"C6",
nombre:"Equipo C6",
grupo:"C",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

/* ---------- GRUPO D ---------- */

{
id:"D1",
nombre:"Equipo D1",
grupo:"D",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"D2",
nombre:"Equipo D2",
grupo:"D",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"D3",
nombre:"Equipo D3",
grupo:"D",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"D4",
nombre:"Equipo D4",
grupo:"D",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"D5",
nombre:"Equipo D5",
grupo:"D",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
},

{
id:"D6",
nombre:"Equipo D6",
grupo:"D",
jugadores:["Jugador 1","Jugador 2","Jugador 3"]
}

];

/* ===========================================
   TABLA DE POSICIONES
=========================================== */

export let tablaGrupos = {

A:[],
B:[],
C:[],
D:[]

};

function crearTabla(){

tablaGrupos.A = [];
tablaGrupos.B = [];
tablaGrupos.C = [];
tablaGrupos.D = [];

equiposV2.forEach((equipo)=>{

tablaGrupos[equipo.grupo].push({

id: equipo.id,

nombre: equipo.nombre,

pj:0,

pg:0,

pp:0,

favor:0,

contra:0,

diferencia:0,

puntos:0

});

});

}

crearTabla();

/* ===========================================
   ENFRENTAMIENTOS
=========================================== */

export const enfrentamientosV2 = {

grupos:[],

octavos:[],

cuartos:[],

semifinales:[],

final:[]

};

/* ===========================================
   GENERAR PARTIDOS DE GRUPOS
=========================================== */

function generarGrupo(letra){

const ids = equiposV2
.filter(e=>e.grupo===letra)
.map(e=>e.id);

for(let i=0;i<ids.length;i++){

for(let j=i+1;j<ids.length;j++){

enfrentamientosV2.grupos.push({

id:`${letra}-${i}${j}`,

grupo: letra,

equipo1: ids[i],

equipo2: ids[j],

estado:"pendiente",

marcador:null

});

}

}

}

["A","B","C","D"].forEach(generarGrupo);

console.log("📅 Partidos generados:", enfrentamientosV2.grupos.length);

/* ===========================================
   ACTUALIZAR TABLA
=========================================== */

export function registrarResultado(idPartido, rondas1, rondas2){

const partido = enfrentamientosV2.grupos.find(p=>p.id===idPartido);

if(!partido) return;

partido.estado = "finalizado";

partido.marcador = [rondas1,rondas2];

const grupo = tablaGrupos[partido.grupo];

const e1 = grupo.find(e=>e.id===partido.equipo1);

const e2 = grupo.find(e=>e.id===partido.equipo2);

e1.pj++;
e2.pj++;

e1.favor += rondas1;
e1.contra += rondas2;

e2.favor += rondas2;
e2.contra += rondas1;

e1.diferencia = e1.favor - e1.contra;
e2.diferencia = e2.favor - e2.contra;

if(rondas1>rondas2){

e1.pg++;
e2.pp++;

e1.puntos += configuracionV2.puntosVictoria;
e2.puntos += configuracionV2.puntosDerrota;

}else{

e2.pg++;
e1.pp++;

e2.puntos += configuracionV2.puntosVictoria;
e1.puntos += configuracionV2.puntosDerrota;

}

grupo.sort((a,b)=>

b.puntos-a.puntos ||

b.diferencia-a.diferencia ||

b.pg-a.pg

);

}

/* ===========================================
   CLASIFICADOS A OCTAVOS
=========================================== */

export function obtenerClasificados(){

let clasificados=[];

Object.values(tablaGrupos).forEach((grupo)=>{

clasificados.push(

...grupo.slice(0, configuracionV2.equiposQueClasifican)

);

});

return clasificados;

}
