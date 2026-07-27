console.log("VERSION OCTAVOS");

import {
  collection,
  addDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";
import { octavos } from "./equipos.js";

/* =========================
   VERIFICAR SI LAS PREDICCIONES ESTÁN ABIERTAS
========================= */

async function verificarEstadoPredicciones() {

  const ref = doc(db, "configuracion", "predicciones");
  const snap = await getDoc(ref);

  if (snap.exists() && snap.data().abiertas === false) {

    document.getElementById("partidos").innerHTML =
      "<h2>🔒 Las predicciones están cerradas.</h2>";

    document.getElementById("nombre").style.display = "none";

    document.querySelector("button").style.display = "none";

    return false;
  }

  return true;
}

/* =========================
   CARGAR OCTAVOS
========================= */

window.addEventListener("DOMContentLoaded", async () => {

  const abiertas = await verificarEstadoPredicciones();

  if (!abiertas) return;

  const contenedor = document.getElementById("partidos");

  contenedor.innerHTML = "";

  octavos.forEach((partido, i) => {

    contenedor.innerHTML += `

<div class="partido">

  <h2>🏆 OCTAVOS - Partido ${i + 1}</h2>

  <div class="versus">

    <div class="team">${partido[0]}</div>

    <div class="vs">VS</div>

    <div class="team">${partido[1]}</div>

  </div>

  <label>
    <input type="radio" name="g${i}" value="${partido[0]}">
    ${partido[0]}
  </label>

  <label>
    <input type="radio" name="g${i}" value="${partido[1]}">
    ${partido[1]}
  </label>

  <br>

  <label>
    <input type="radio" name="r${i}" value="2-0">
    2 - 0
  </label>

  <label>
    <input type="radio" name="r${i}" value="2-1">
    2 - 1
  </label>

</div>

`;
  });
});

/* =========================
   ENVIAR PREDICCIONES
========================= */

async function enviarPredicciones() {

  const nombre = document.getElementById("nombre").value.trim();

  if (nombre === "") {

    alert("Escribe tu nombre o Nick");
    return;
  }

  const datos = {

    nombre,

    fecha: new Date().toLocaleString(),

    fase: "octavos",

    predicciones: []
  };

  for (let i = 0; i < octavos.length; i++) {

    const ganador = document.querySelector(`input[name="g${i}"]:checked`);
    const resultado = document.querySelector(`input[name="r${i}"]:checked`);

    if (!ganador || !resultado) {

      alert(`Completa el Partido ${i + 1}`);
      return;
    }

    datos.predicciones.push({

      partido: i + 1,
      ganador: ganador.value,
      resultado: resultado.value
    });
  }

  try {

    await addDoc(
      collection(db, "predicciones"),
      datos
    );

    alert("✅ Predicciones enviadas correctamente.");

    location.reload();

  } catch (error) {

    console.error(error);
    alert("❌ Error al enviar las predicciones.");
  }
}

/* =========================
   FUNCIONES GLOBALES
========================= */

window.enviarPredicciones = enviarPredicciones;

console.log("SCRIPT OCTAVOS LISTO");
