import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";
import { octavos } from "./equipos.js";

/* =========================
   PROTEGER PANEL
========================= */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

/* =========================
   REFERENCIAS
========================= */

const contenedor = document.getElementById("adminPartidos");
const mensajePanel = document.getElementById("mensaje-panel");

/* =========================
   ESCAPAR TEXTO
========================= */

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   CARGAR PARTIDOS
========================= */

function cargarPartidos() {
  contenedor.innerHTML = "";

  octavos.forEach((partido, i) => {
    const equipo1 = escaparHTML(partido[0]);
    const equipo2 = escaparHTML(partido[1]);

    contenedor.insertAdjacentHTML("beforeend", `
      <article class="partido admin-partido">

        <h2 class="partido-titulo">
          🏆 OCTAVOS - PARTIDO ${i + 1}
        </h2>

        <p class="resultado-titulo">
          Ganador oficial
        </p>

        <div class="seleccion-equipos">

          <label class="team-card">
            <input
              type="radio"
              name="admin-g${i}"
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
              name="admin-g${i}"
              value="${equipo2}"
            >

            <span class="team-card-nombre">
              ${equipo2}
            </span>
          </label>

        </div>

        <div class="resultado-contenedor">

          <p class="resultado-titulo">
            Marcador oficial
          </p>

          <div class="resultado-opciones">

            <label class="score-card">
              <input
                type="radio"
                name="admin-r${i}"
                value="2-0"
              >

              <span>2 - 0</span>
            </label>

            <label class="score-card">
              <input
                type="radio"
                name="admin-r${i}"
                value="2-1"
              >

              <span>2 - 1</span>
            </label>

          </div>

        </div>

      </article>
    `);
  });
}

/* =========================
   CARGAR RESULTADOS GUARDADOS
========================= */

async function cargarResultadosGuardados() {
  try {
    const referencia = doc(db, "resultados", "octavos");
    const snap = await getDoc(referencia);

    if (!snap.exists()) return;

    const resultados = snap.data().resultados;

    if (!Array.isArray(resultados)) return;

    resultados.forEach((resultado) => {
      const indice = Number(resultado.partido) - 1;

      if (indice < 0 || indice >= octavos.length) return;

      const ganadorInput = document.querySelector(
        `input[name="admin-g${indice}"][value="${CSS.escape(resultado.ganador)}"]`
      );

      const resultadoInput = document.querySelector(
        `input[name="admin-r${indice}"][value="${CSS.escape(resultado.resultado)}"]`
      );

      if (ganadorInput) {
        ganadorInput.checked = true;
      }

      if (resultadoInput) {
        resultadoInput.checked = true;
      }
    });

  } catch (error) {
    console.error("Error al cargar resultados:", error);

    mensajePanel.textContent =
      "No se pudieron cargar los resultados guardados.";
  }
}

/* =========================
   GUARDAR RESULTADOS
========================= */

async function guardarResultados() {
  const boton = document.getElementById("btn-resultados");
  const resultados = [];

  for (let i = 0; i < octavos.length; i++) {
    const ganador = document.querySelector(
      `input[name="admin-g${i}"]:checked`
    );

    const marcador = document.querySelector(
      `input[name="admin-r${i}"]:checked`
    );

    /*
      Permite dejar partidos todavía no jugados.
      Pero si se completa uno de los dos campos,
      exige completar ambos.
    */

    if (!ganador && !marcador) {
      continue;
    }

    if (!ganador || !marcador) {
      alert(
        `Completa ganador y marcador del Partido ${i + 1}, o deja ambos vacíos.`
      );

      document
        .querySelectorAll(".admin-partido")
        [i]
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      return;
    }

    resultados.push({
      partido: i + 1,
      ganador: ganador.value,
      resultado: marcador.value
    });
  }

  if (resultados.length === 0) {
    alert("Todavía no seleccionaste ningún resultado.");

    return;
  }

  try {
    boton.disabled = true;
    boton.textContent = "GUARDANDO...";

    await setDoc(
      doc(db, "resultados", "octavos"),
      {
        fase: "octavos",
        resultados,
        actualizado: new Date().toLocaleString("es-AR")
      }
    );

    mensajePanel.textContent =
      "✅ Resultados guardados correctamente.";

    alert("✅ Resultados oficiales actualizados.");

  } catch (error) {
    console.error("Error al guardar resultados:", error);

    mensajePanel.textContent =
      "❌ No se pudieron guardar los resultados.";

    alert("❌ Error al guardar los resultados.");

  } finally {
    boton.disabled = false;
    boton.textContent = "GUARDAR RESULTADOS";
  }
}

/* =========================
   ESTADO DE PREDICCIONES
========================= */

async function cargarEstado() {
  try {
    const snap = await getDoc(
      doc(db, "configuracion", "predicciones")
    );

    if (snap.exists()) {
      document.getElementById("estadoPredicciones").checked =
        snap.data().abiertas === true;
    }

  } catch (error) {
    console.error("Error al cargar estado:", error);
  }
}

async function guardarEstado() {
  const boton = document.getElementById("btn-estado");

  const abiertas =
    document.getElementById("estadoPredicciones").checked;

  try {
    boton.disabled = true;
    boton.textContent = "GUARDANDO...";

    await setDoc(
      doc(db, "configuracion", "predicciones"),
      {
        abiertas
      }
    );

    alert(
      abiertas
        ? "✅ Predicciones abiertas."
        : "🔒 Predicciones cerradas."
    );

  } catch (error) {
    console.error("Error al guardar estado:", error);

    alert("❌ No se pudo actualizar el estado.");

  } finally {
    boton.disabled = false;
    boton.textContent = "GUARDAR ESTADO";
  }
}

/* =========================
   FUNCIONES GLOBALES
========================= */

window.guardarEstado = guardarEstado;
window.guardarResultados = guardarResultados;

/* =========================
   INICIAR PANEL
========================= */

cargarPartidos();
cargarEstado();
cargarResultadosGuardados();
