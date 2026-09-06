import {
  equiposV2,
  enfrentamientosV2,
  configuracionV2
} from "./equipos-v2.js";

console.log("🏆 PICK'EM V2 CARGADO");

let grupoActivo = "A";

const contenedor = document.getElementById("partidos-v2");
const tabla = document.getElementById("tabla-posiciones-v2");

const grupoTexto = document.getElementById("grupo-actual-v2");
const contador = document.getElementById("contador-progreso-v2");
const barra = document.getElementById("barra-progreso-v2-fill");

/* =========================
   EQUIPO
========================= */

function obtenerEquipo(id){
  return equiposV2.find(e=>e.id===id);
}

/* =========================
   TARJETA PARTIDO
========================= */

function crearPartido(partido, numero){

  const e1 = obtenerEquipo(partido.equipo1);
  const e2 = obtenerEquipo(partido.equipo2);

  return `

  <article class="partido-v2">

      <div class="partido-v2-header">

          <span>PARTIDO ${numero}</span>

          <small>GRUPO ${grupoActivo}</small>

      </div>

      <div class="enfrentamiento-v2">

          <label class="equipo-v2-card">

              <input
                type="radio"
                name="ganador-${numero}"
                value="${e1.id}"
              >

              <img src="${e1.logo}" class="logo-team-v2">

              <span>${e1.nombre}</span>

          </label>

          <div class="vs-v2">VS</div>

          <label class="equipo-v2-card">

              <input
                type="radio"
                name="ganador-${numero}"
                value="${e2.id}"
              >

              <img src="${e2.logo}" class="logo-team-v2">

              <span>${e2.nombre}</span>

          </label>

      </div>

      <div class="marcador-v2">

          <p>MARCADOR FINAL</p>

          <div class="marcadores-v2">

              <label class="score-v2">
                  <input type="radio" name="marcador-${numero}" value="2-0">
                  <span>2-0</span>
              </label>

              <label class="score-v2">
                  <input type="radio" name="marcador-${numero}" value="2-1">
                  <span>2-1</span>
              </label>

          </div>

      </div>

      <div class="puntos-posibles-v2">

          <span>🎯 Si acertás:</span>

          <strong>+5 PUNTOS</strong>

      </div>

  </article>

  `;
}

/* =========================
   TABLA DEL GRUPO
========================= */

function cargarTabla(){

  const equipos = equiposV2.filter(e=>e.grupo===grupoActivo);

  tabla.innerHTML = equipos.map((equipo,i)=>`

      <div class="fila-tabla-v2 ${i<configuracionV2.equiposQueClasifican ? "clasifica" : ""}">

          <span class="puesto">${i+1}</span>

          <div class="info-equipo">

              <img src="${equipo.logo}" class="logo-tabla-v2">

              <strong>${equipo.nombre}</strong>

          </div>

          <span class="pts">0 PTS</span>

      </div>

  `).join("");

}

/* =========================
   CARGAR PARTIDOS
========================= */

function cargarGrupo(){

  grupoTexto.textContent = `GRUPO ${grupoActivo}`;

  const partidos = enfrentamientosV2.grupos.filter(
    p=>p.grupo===grupoActivo
  );

  contador.textContent = `0 / ${partidos.length} PARTIDOS`;

  barra.style.width = "0%";

  contenedor.innerHTML = partidos.map(
    (p,i)=>crearPartido(p,i+1)
  ).join("");

  cargarTabla();

}

/* =========================
   CAMBIAR GRUPO
========================= */

window.cambiarGrupo = function(grupo){

  grupoActivo = grupo;

  document.querySelectorAll(".tab-grupo").forEach(btn=>{

      btn.classList.remove("activa");

      if(btn.dataset.grupo===grupo){
          btn.classList.add("activa");
      }

  });

  cargarGrupo();

}

/* =========================
   PROGRESO
========================= */

document.addEventListener("change",()=>{

  const total = enfrentamientosV2.grupos.filter(
    p=>p.grupo===grupoActivo
  ).length;

  let completos = 0;

  for(let i=1;i<=total;i++){

      const g = document.querySelector(`input[name="ganador-${i}"]:checked`);
      const m = document.querySelector(`input[name="marcador-${i}"]:checked`);

      if(g && m) completos++;

  }

  contador.textContent = `${completos} / ${total} PARTIDOS`;

  barra.style.width = `${(completos/total)*100}%`;

});

/* =========================
   ENVIAR
========================= */

window.enviarPrediccionesV2 = function(){

  const nombre = document.getElementById("nombre-v2").value.trim();

  if(nombre===""){
      alert("Escribe tu nombre.");
      return;
  }

  alert(`✅ Predicciones de ${nombre} listas para enviarse.`);

};

/* =========================
   PESTAÑAS
========================= */

document.querySelectorAll(".tab-grupo").forEach(btn=>{

  btn.addEventListener("click",()=>{

      cambiarGrupo(btn.dataset.grupo);

  });

});

cargarGrupo();
