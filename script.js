console.log("VERSION OCTAVOS - TARJETAS");

import {
  collection,
  addDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";
import { octavos } from "./equipos.js";

/* =========================
   VERIFICAR ESTADO
========================= */

async function verificarEstadoPredicciones() {
  try {
    const ref = doc(db, "configuracion", "predicciones");
    const snap = await getDoc(ref);

    if (snap.exists() && snap.data().abiertas === false) {
      document.getElementById("partidos").innerHTML = `
        <div class="predicciones-cerradas">
          <h2>🔒 Las predicciones están cerradas</h2>
          <p>Ya no se pueden enviar nuevas predicciones.</p>
        </div>
      `;

      document.getElementById("nombre").style.display = "none";

      const boton = document.getElementById("btn-enviar");

      if (boton) {
        boton.style.display = "none";
      }

      return false;
    }

    return true;

  } catch (error) {
    console.error("Error al comprobar el estado:", error);

    alert("No se pudo comprobar el estado de las predicciones.");

    return false;
  }
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
    const equipo1 = partido[0];
    const equipo2 = partido[1];

    contenedor.insertAdjacentHTML("beforeend", `
      <article class="partido">

        <h2 class="partido-titulo">
          🏆 OCTAVOS - PARTIDO ${i + 1}
        </h2>

        <div class="seleccion-equipos">

          <label class="team-card">

            <input
              type="radio"
              name="g${i}"
              value="${equipo1}"
            >

            <span class="team-card-nombre">
              ${equipo1}
            </span>

          </label>

          <div class="vs">
            VS
          </div>

          <label class="team-card">

            <input
              type="radio"
              name="g${i}"
              value="${equipo2}"
            >

            <span class="team-card-nombre">
              ${equipo2}
            </span>

          </label>

        </div>

        <div class="resultado-contenedor">

          <p class="resultado-titulo">
            Resultado
          </p>

          <div class="resultado-opciones">

            <label class="score-card">

              <input
                type="radio"
                name="r${i}"
                value="2-0"
              >

              <span>
                2 - 0
              </span>

            </label>

            <label class="score-card">

              <input
                type="radio"
                name="r${i}"
                value="2-1"
              >

              <span>
                2 - 1
              </span>

            </label>

          </div>

        </div>

      </article>
    `);
  });
});

/* =========================
   ENVIAR PREDICCIONES
========================= */

async function enviarPredicciones() {
  const inputNombre = document.getElementById("nombre");
  const botonEnviar = document.getElementById("btn-enviar");

  const nombre = inputNombre.value.trim();

  if (nombre === "") {
    alert("Escribe tu nombre o Nick.");

    inputNombre.focus();

    return;
  }

  const datos = {
    nombre,
    fecha: new Date().toLocaleString("es-AR"),
    fase: "octavos",
    predicciones: []
  };

  for (let i = 0; i < octavos.length; i++) {
    const ganador = document.querySelector(
      `input[name="g${i}"]:checked`
    );

    const resultado = document.querySelector(
      `input[name="r${i}"]:checked`
    );

    if (!ganador) {
      alert(`Elige al ganador del Partido ${i + 1}.`);

      document
        .querySelectorAll(".partido")
        [i]
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      return;
    }

    if (!resultado) {
      alert(`Elige el resultado del Partido ${i + 1}.`);

      document
        .querySelectorAll(".partido")
        [i]
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      return;
    }

    datos.predicciones.push({
      partido: i + 1,
      ganador: ganador.value,
      resultado: resultado.value
    });
  }

  try {
    botonEnviar.disabled = true;
    botonEnviar.textContent = "ENVIANDO...";

    await addDoc(
      collection(db, "predicciones"),
      datos
    );

    alert("✅ Predicciones enviadas correctamente.");

    location.reload();

  } catch (error) {
    console.error("Error al enviar:", error);

    alert("❌ Error al enviar las predicciones.");

    botonEnviar.disabled = false;
    botonEnviar.textContent = "ENVIAR PREDICCIONES";
  }
}

/* =========================
   FUNCIÓN GLOBAL
========================= */

window.enviarPredicciones = enviarPredicciones;

console.log("SCRIPT OCTAVOS CON TARJETAS LISTO");
