console.log("🔥 NOVA CLASH II - PICK'EM V2");

import {
  equiposV2,
  enfrentamientosV2,
  configuracionV2
} from "./equipos-v2.js";

/* ==========================
   ELEMENTOS
========================== */

const contenedor = document.getElementById("partidos-v2");
const tituloFase = document.getElementById("titulo-fase-v2");
const estadoTexto = document.getElementById("estado-pickem-texto");
const botonEnviar = document.getElementById("btn-enviar-v2");

/* ==========================
   BUSCAR EQUIPO
========================== */

function obtenerEquipo(id) {
  return equiposV2.find(e => e.id === id);
}

/* ==========================
   NOMBRE DE FASE
========================== */

const nombresFase = {
  grupos: "FASE DE GRUPOS",
  octavos: "OCTAVOS DE FINAL",
  cuartos: "CUARTOS DE FINAL",
  semifinales: "SEMIFINALES",
  final: "GRAN FINAL"
};

/* ==========================
   MARCADORES
========================== */

function obtenerMarcadores() {

  if (
    configuracionV2.faseActiva === "semifinales" ||
    configuracionV2.faseActiva === "final"
  ) {
    return ["3-0","3-1","3-2"];
  }

  return ["2-0","2-1"];

}

/* ==========================
   CREAR PARTIDO
========================== */

function crearPartido(partido, numero){

  const equipo1 = obtenerEquipo(partido.equipo1);
  const equipo2 = obtenerEquipo(partido.equipo2);

  if(!equipo1 || !equipo2){
    return "";
  }

  const marcadores = obtenerMarcadores();

  return `

  <article class="partido-v2">

    <div class="partido-v2-header">

      <span>PARTIDO ${numero}</span>

      <small>${nombresFase[configuracionV2.faseActiva]}</small>

    </div>

    <div class="enfrentamiento-v2">

      <label class="equipo-v2-card">

        <input
          type="radio"
          name="ganador-${numero}"
          value="${equipo1.nombre}"
        >

        <span>${equipo1.nombre}</span>

      </label>

      <div class="vs-v2">VS</div>

      <label class="equipo-v2-card">

        <input
          type="radio"
          name="ganador-${numero}"
          value="${equipo2.nombre}"
        >

        <span>${equipo2.nombre}</span>

      </label>

    </div>

    <div class="marcador-v2">

      <p>MARCADOR FINAL</p>

      <div class="marcadores-v2">

        ${marcadores.map(score=>`

          <label class="score-v2">

            <input
              type="radio"
              name="marcador-${numero}"
              value="${score}"
            >

            <span>${score}</span>

          </label>

        `).join("")}

      </div>

    </div>

  </article>

  `;

}

/* ==========================
   CARGAR PARTIDOS
========================== */

function cargarPartidos(){

  tituloFase.textContent =
    nombresFase[configuracionV2.faseActiva];

  estadoTexto.textContent =
    configuracionV2.prediccionesAbiertas
      ? "PREDICCIONES ABIERTAS"
      : "PREDICCIONES CERRADAS";

  const partidos =
    enfrentamientosV2[configuracionV2.faseActiva];

  if(!partidos || partidos.length===0){

    contenedor.innerHTML = `
      <div class="pickem-vacio-v2">

        <h3>🏆 No hay partidos disponibles</h3>

        <p>Pronto aparecerán los enfrentamientos.</p>

      </div>
    `;

    return;

  }

  contenedor.innerHTML =
    partidos.map((p,i)=>crearPartido(p,i+1)).join("");

  if(!configuracionV2.prediccionesAbiertas){

    document
      .querySelectorAll("#partidos-v2 input")
      .forEach(i=>i.disabled=true);

    botonEnviar.disabled = true;

    botonEnviar.textContent = "PREDICCIONES CERRADAS";

  }

}

/* ==========================
   LEER PREDICCIONES
========================== */

function obtenerPredicciones(){

  const partidos =
    enfrentamientosV2[configuracionV2.faseActiva];

  const lista = [];

  for(let i=1;i<=partidos.length;i++){

    const ganador =
      document.querySelector(`input[name="ganador-${i}"]:checked`);

    const marcador =
      document.querySelector(`input[name="marcador-${i}"]:checked`);

    if(!ganador){
      alert(`Elegí el ganador del Partido ${i}.`);
      return null;
    }

    if(!marcador){
      alert(`Elegí el marcador del Partido ${i}.`);
      return null;
    }

    lista.push({
      partido:i,
      ganador:ganador.value,
      marcador:marcador.value
    });

  }

  return lista;

}

/* ==========================
   ENVIAR
========================== */

window.enviarPrediccionesV2 = function(){

  const nombre =
    document.getElementById("nombre-v2").value.trim();

  if(nombre===""){
    alert("Escribí tu nombre.");
    return;
  }

  const predicciones = obtenerPredicciones();

  if(!predicciones) return;

  console.log({
    nombre,
    fase: configuracionV2.faseActiva,
    predicciones
  });

  alert("✅ Predicciones listas (todavía no se guardan en Firebase).");

}

/* ==========================
   INICIO
========================== */

document.addEventListener("DOMContentLoaded", cargarPartidos);
