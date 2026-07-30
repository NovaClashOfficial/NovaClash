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
   BONUS DE OCTAVOS
========================= */

function normalizarNombreBonus(nombre) {
  return String(nombre || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function crearIdBonus(nombreNormalizado) {
  return encodeURIComponent(nombreNormalizado);
}

async function comprobarBonus() {
  const inputNombre =
    document.getElementById("nombre-bonus");

  const boton =
    document.getElementById("btn-reclamar-bonus");

  const mensaje =
    document.getElementById("mensaje-bonus");

  if (!inputNombre || !boton || !mensaje) {
    return;
  }

  const nombre = inputNombre.value.trim();

  if (!nombre) {
    mensaje.textContent = "";
    boton.disabled = false;
    boton.textContent = "🎁 RECLAMAR +3 PUNTOS";
    return;
  }

  const nombreNormalizado =
    normalizarNombreBonus(nombre);

  const idBonus =
    crearIdBonus(nombreNormalizado);

  try {
    const referencia = doc(
      db,
      "bonusOctavos",
      idBonus
    );

    const documento = await getDoc(referencia);

    if (documento.exists()) {
      boton.disabled = true;
      boton.textContent = "✅ BONUS YA RECLAMADO";

      mensaje.textContent =
        "Este nombre ya reclamó los +3 puntos.";

      mensaje.className = "mensaje-bonus-exito";
    } else {
      boton.disabled = false;
      boton.textContent = "🎁 RECLAMAR +3 PUNTOS";

      mensaje.textContent = "";
      mensaje.className = "";
    }

  } catch (error) {
    console.error(
      "Error al comprobar el bonus:",
      error
    );
  }
}

async function reclamarBonus() {
  const inputNombre =
    document.getElementById("nombre-bonus");

  const boton =
    document.getElementById("btn-reclamar-bonus");

  const mensaje =
    document.getElementById("mensaje-bonus");

  const nombre = inputNombre.value.trim();

  if (!nombre) {
    mensaje.textContent =
      "Escribí tu nombre o Nick.";

    mensaje.className = "mensaje-bonus-error";

    inputNombre.focus();
    return;
  }

  const nombreNormalizado =
    normalizarNombreBonus(nombre);

  if (nombreNormalizado.length < 2) {
    mensaje.textContent =
      "El nombre es demasiado corto.";

    mensaje.className = "mensaje-bonus-error";
    return;
  }

  const idBonus =
    crearIdBonus(nombreNormalizado);

  const referencia = doc(
    db,
    "bonusOctavos",
    idBonus
  );

  try {
    boton.disabled = true;
    boton.textContent = "RECLAMANDO...";

    await runTransaction(
      db,
      async (transaccion) => {
        const documento =
          await transaccion.get(referencia);

        if (documento.exists()) {
          throw new Error(
            "BONUS_YA_RECLAMADO"
          );
        }

        transaccion.set(referencia, {
          nombre: nombre,
          nombreNormalizado:
            nombreNormalizado,

          puntos: 3,
          reclamado: true,

          fecha: serverTimestamp()
        });
      }
    );

    mensaje.textContent =
      "🎉 ¡Bonus reclamado! Recibiste +3 puntos.";

    mensaje.className = "mensaje-bonus-exito";

    boton.textContent =
      "✅ BONUS RECLAMADO";

    inputNombre.disabled = true;

  } catch (error) {
    console.error(
      "Error al reclamar el bonus:",
      error
    );

    if (
      error.message ===
      "BONUS_YA_RECLAMADO"
    ) {
      mensaje.textContent =
        "Este nombre ya reclamó el bonus.";

      mensaje.className =
        "mensaje-bonus-error";

      boton.textContent =
        "✅ BONUS YA RECLAMADO";

      boton.disabled = true;

      return;
    }

    mensaje.textContent =
      "No se pudo reclamar el bonus. Intentá nuevamente.";

    mensaje.className =
      "mensaje-bonus-error";

    boton.disabled = false;
    boton.textContent =
      "🎁 RECLAMAR +3 PUNTOS";
  }
}

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
const botonBonus =
  document.getElementById(
    "btn-reclamar-bonus"
  );

const inputBonus =
  document.getElementById(
    "nombre-bonus"
  );

if (botonBonus) {
  botonBonus.addEventListener(
    "click",
    reclamarBonus
  );
}

if (inputBonus) {
  inputBonus.addEventListener(
    "change",
    comprobarBonus
  );

  inputBonus.addEventListener(
    "blur",
    comprobarBonus
  );
}

window.enviarPredicciones = enviarPredicciones;

console.log("SCRIPT OCTAVOS CON TARJETAS LISTO");
