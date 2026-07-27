console.log("PANEL OCTAVOS V2");

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

const contenedor = document.getElementById("adminPartidos");
const mensajePanel = document.getElementById("mensaje-panel");

/* =========================
   PROTEGER PANEL
========================= */

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    window.location.href = "login.html";
  }
});

/* =========================
   CREAR PARTIDOS
========================= */

function cargarPartidos() {
  contenedor.innerHTML = "";

  octavos.forEach((partido, i) => {
    const equipo1 = partido[0];
    const equipo2 = partido[1];

    contenedor.insertAdjacentHTML("beforeend", `
      <article class="partido admin-partido">

        <h2>
          🏆 OCTAVOS - PARTIDO ${i + 1}
        </h2>

        <p class="resultado-titulo">
          Ganador oficial
        </p>

        <div class="enfrentamiento">

          <label class="team">

            <input
              type="radio"
              name="admin-g${i}"
              value="${equipo1}"
            >

            <span>${equipo1}</span>

          </label>

          <div class="vs">
            VS
          </div>

          <label class="team">

            <input
              type="radio"
              name="admin-g${i}"
              value="${equipo2}"
            >

            <span>${equipo2}</span>

          </label>

        </div>

        <p class="resultado-titulo">
          Resultado oficial
        </p>

        <div class="resultados">

          <label class="resultado">

            <input
              type="radio"
              name="admin-r${i}"
              value="2-0"
            >

            <span>2 - 0</span>

          </label>

          <label class="resultado">

            <input
              type="radio"
              name="admin-r${i}"
              value="2-1"
            >

            <span>2 - 1</span>

          </label>

        </div>

      </article>
    `);
  });
}

/* =========================
   MARCAR RADIO GUARDADO
========================= */

function marcarRadio(nombre, valor) {
  const opciones = document.querySelectorAll(
    `input[name="${nombre}"]`
  );

  opciones.forEach((opcion) => {
    if (opcion.value === valor) {
      opcion.checked = true;
    }
  });
}

/* =========================
   CARGAR RESULTADOS GUARDADOS
========================= */

async function cargarResultadosGuardados() {
  try {
    const referencia = doc(
      db,
      "resultados",
      "octavos"
    );

    const snap = await getDoc(referencia);

    if (!snap.exists()) {
      return;
    }

    const datos = snap.data();

    if (!Array.isArray(datos.resultados)) {
      return;
    }

    datos.resultados.forEach((resultado) => {
      const indice = Number(resultado.partido) - 1;

      if (
        indice < 0 ||
        indice >= octavos.length
      ) {
        return;
      }

      marcarRadio(
        `admin-g${indice}`,
        resultado.ganador
      );

      marcarRadio(
        `admin-r${indice}`,
        resultado.resultado
      );
    });

    mensajePanel.textContent =
      "✅ Resultados guardados cargados.";

  } catch (error) {
    console.error(
      "Error al cargar resultados:",
      error
    );

    mensajePanel.textContent =
      "❌ No se pudieron cargar los resultados.";
  }
}

/* =========================
   GUARDAR RESULTADOS
========================= */

async function guardarResultados() {
  const boton = document.getElementById(
    "btn-resultados"
  );

  const resultados = [];

  for (let i = 0; i < octavos.length; i++) {
    const ganador = document.querySelector(
      `input[name="admin-g${i}"]:checked`
    );

    const resultado = document.querySelector(
      `input[name="admin-r${i}"]:checked`
    );

    /*
      Si ambos están vacíos, el partido todavía
      no fue jugado y simplemente se ignora.
    */

    if (!ganador && !resultado) {
      continue;
    }

    /*
      Si eliges solamente uno, se detiene.
    */

    if (!ganador || !resultado) {
      alert(
        `Completa ganador y resultado del Partido ${i + 1}.`
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
      resultado: resultado.value
    });
  }

  if (resultados.length === 0) {
    alert(
      "Selecciona al menos un resultado."
    );

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
        actualizado:
          new Date().toLocaleString("es-AR")
      }
    );

    mensajePanel.textContent =
      `✅ ${resultados.length} resultado(s) guardado(s).`;

    alert(
      "✅ Resultados oficiales guardados."
    );

  } catch (error) {
    console.error(
      "Error al guardar resultados:",
      error
    );

    mensajePanel.textContent =
      "❌ Error al guardar resultados.";

    alert(
      "❌ No se pudieron guardar los resultados."
    );

  } finally {
    boton.disabled = false;
    boton.textContent = "GUARDAR RESULTADOS";
  }
}

/* =========================
   CARGAR ESTADO DEL PICK'EM
========================= */

async function cargarEstado() {
  try {
    const referencia = doc(
      db,
      "configuracion",
      "predicciones"
    );

    const snap = await getDoc(referencia);

    if (!snap.exists()) {
      return;
    }

    document.getElementById(
      "estadoPredicciones"
    ).checked = snap.data().abiertas === true;

  } catch (error) {
    console.error(
      "Error al cargar estado:",
      error
    );
  }
}

/* =========================
   GUARDAR ESTADO DEL PICK'EM
========================= */

async function guardarEstado() {
  const checkbox = document.getElementById(
    "estadoPredicciones"
  );

  const boton = document.getElementById(
    "btn-estado"
  );

  const abiertas = checkbox.checked;

  try {
    boton.disabled = true;
    boton.textContent = "GUARDANDO...";

    await setDoc(
      doc(
        db,
        "configuracion",
        "predicciones"
      ),
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
    console.error(
      "Error al guardar estado:",
      error
    );

    alert(
      "❌ No se pudo cambiar el estado."
    );

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
   INICIAR
========================= */

cargarPartidos();
cargarEstado();
cargarResultadosGuardados();

console.log("PANEL OCTAVOS LISTO");
