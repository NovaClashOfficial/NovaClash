   console.log("PICK'EM CUARTOS V1");

import {
  collection,
  addDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

import {
  cuartos,
  opcionesHipercargas,
  rondasCuartos
} from "./equipos.js";

/* =========================
   ESCAPAR TEXTO
========================= */

function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   VERIFICAR ESTADO
========================= */

async function verificarEstadoPredicciones() {
  try {
    const referencia = doc(
      db,
      "configuracion",
      "predicciones"
    );

    const snap = await getDoc(referencia);

    if (
      snap.exists() &&
      snap.data().abiertas === false
    ) {
      document.getElementById("partidos").innerHTML = `
        <div class="predicciones-cerradas">
          <h2>🔒 Las predicciones están cerradas</h2>

          <p>
            Ya no se pueden enviar predicciones de Cuartos.
          </p>
        </div>
      `;

      const nombre =
        document.getElementById("nombre");

      const boton =
        document.getElementById("btn-enviar");

      if (nombre) {
        nombre.style.display = "none";
      }

      if (boton) {
        boton.style.display = "none";
      }

      return false;
    }

    return true;

  } catch (error) {
    console.error(
      "Error al comprobar el estado:",
      error
    );

    document.getElementById("partidos").innerHTML = `
      <div class="predicciones-cerradas">
        <h2>❌ Error</h2>

        <p>
          No se pudo comprobar el estado de las predicciones.
        </p>
      </div>
    `;

    return false;
  }
}

/* =========================
   CREAR OPCIONES DE MVP
========================= */

function crearOpcionesMVP(
  numeroPartido,
  rondaId,
  equipo1,
  equipo2
) {
  const jugadores = [
    ...equipo1.jugadores.map((jugador) => ({
      nombre: jugador,
      equipo: equipo1.nombre
    })),

    ...equipo2.jugadores.map((jugador) => ({
      nombre: jugador,
      equipo: equipo2.nombre
    }))
  ];

  return jugadores.map((jugador) => `
    <label class="mvp-card">

      <input
        type="radio"
        name="mvp-${numeroPartido}-${rondaId}"
        value="${escaparHTML(jugador.nombre)}"
      >

      <span class="mvp-nombre">
        ⭐ ${escaparHTML(jugador.nombre)}

        <small class="mvp-equipo">
          ${escaparHTML(jugador.equipo)}
        </small>
      </span>

    </label>
  `).join("");
}

/* =========================
   CREAR OPCIONES DE HIPERCARGAS
========================= */

function crearOpcionesHipercargas(
  numeroPartido,
  rondaId
) {
  return opcionesHipercargas.map((opcion) => `
    <label class="hipercarga-card">

      <input
        type="radio"
        name="hipercargas-${numeroPartido}-${rondaId}"
        value="${escaparHTML(opcion.valor)}"
      >

      <span>
        ⚡ ${escaparHTML(opcion.texto)}
      </span>

    </label>
  `).join("");
}

/* =========================
   CREAR RONDAS
========================= */

function crearRondas(
  numeroPartido,
  equipo1,
  equipo2
) {
  return rondasCuartos.map((ronda) => `
    <section
      class="ronda-prediccion ${
        ronda.sumaPuntos
          ? ""
          : "ronda-desempate"
      }"
    >

      <div class="ronda-encabezado">

        <h3>
          ${escaparHTML(ronda.nombre)}
        </h3>

        ${
          ronda.sumaPuntos
            ? `
              <span class="ronda-puntos">
                Suma puntos
              </span>
            `
            : `
              <span class="ronda-sin-puntos">
                No suma puntos
              </span>
            `
        }

      </div>

      <p class="opcion-titulo">
        ⭐ MVP de la ronda
      </p>

      <div class="mvp-opciones">

        ${crearOpcionesMVP(
          numeroPartido,
          ronda.id,
          equipo1,
          equipo2
        )}

      </div>

      <p class="opcion-titulo">
        ⚡ Hipercargas activadas en la ronda
      </p>

      <div class="hipercargas-opciones">

        ${crearOpcionesHipercargas(
          numeroPartido,
          ronda.id
        )}

      </div>

    </section>
  `).join("");
}

/* =========================
   CARGAR CUARTOS
========================= */

window.addEventListener(
  "DOMContentLoaded",
  async () => {
    const abiertas =
      await verificarEstadoPredicciones();

    if (!abiertas) return;

    const contenedor =
      document.getElementById("partidos");

    contenedor.innerHTML = "";

    cuartos.forEach((partido, indice) => {
      const numeroPartido = indice + 1;

      const equipo1 = partido[0];
      const equipo2 = partido[1];

      contenedor.insertAdjacentHTML(
        "beforeend",
        `
          <article
            class="partido partido-cuartos"
            data-partido="${numeroPartido}"
          >

            <h2 class="partido-titulo">
              🏆 CUARTOS — PARTIDO ${numeroPartido}
            </h2>

            <p class="opcion-titulo">
              Elegí al ganador del cruce
            </p>

            <div class="seleccion-equipos">

              <label class="team-card">

                <input
                  type="radio"
                  name="ganador-${numeroPartido}"
                  value="${escaparHTML(equipo1.nombre)}"
                >

                <span class="team-card-nombre">
                  ${escaparHTML(equipo1.nombre)}
                </span>

              </label>

              <div class="vs">
                VS
              </div>

              <label class="team-card">

                <input
                  type="radio"
                  name="ganador-${numeroPartido}"
                  value="${escaparHTML(equipo2.nombre)}"
                >

                <span class="team-card-nombre">
                  ${escaparHTML(equipo2.nombre)}
                </span>

              </label>

            </div>

            <div class="resultado-contenedor">

              <p class="opcion-titulo">
                🎯 Marcador final
              </p>

              <div class="resultado-opciones">

                <label class="score-card">

                  <input
                    type="radio"
                    name="resultado-${numeroPartido}"
                    value="2-0"
                  >

                  <span>2 - 0</span>

                </label>

                <label class="score-card">

                  <input
                    type="radio"
                    name="resultado-${numeroPartido}"
                    value="2-1"
                  >

                  <span>2 - 1</span>

                </label>

              </div>

            </div>

            <div class="rondas-contenedor">

              ${crearRondas(
                numeroPartido,
                equipo1,
                equipo2
              )}

            </div>

          </article>
        `
      );
    });
  }
);

/* =========================
   MOVERSE AL PARTIDO
========================= */

function mostrarPartidoConError(indice) {
  const tarjetas =
    document.querySelectorAll(
      ".partido-cuartos"
    );

  tarjetas[indice]?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  tarjetas[indice]?.classList.add(
    "partido-error"
  );

  setTimeout(() => {
    tarjetas[indice]?.classList.remove(
      "partido-error"
    );
  }, 1800);
}

/* =========================
   LEER UNA RONDA
========================= */

function leerRonda(
  numeroPartido,
  ronda
) {
  const mvp = document.querySelector(
    `input[name="mvp-${numeroPartido}-${ronda.id}"]:checked`
  );

  const hipercargas =
    document.querySelector(
      `input[name="hipercargas-${numeroPartido}-${ronda.id}"]:checked`
    );

  return {
    mvp,
    hipercargas
  };
}

/* =========================
   ENVIAR PREDICCIONES
========================= */

async function enviarPredicciones() {
  const inputNombre =
    document.getElementById("nombre");

  const botonEnviar =
    document.getElementById("btn-enviar");

  const nombre =
    inputNombre.value.trim();

  if (!nombre) {
    alert("Escribí tu nombre o Nick.");

    inputNombre.focus();

    return;
  }

  const datos = {
    nombre,

    fecha:
      new Date().toLocaleString("es-AR"),

    fase: "cuartos",

    predicciones: []
  };

  for (
    let indice = 0;
    indice < cuartos.length;
    indice++
  ) {
    const numeroPartido = indice + 1;

    const ganador =
      document.querySelector(
        `input[name="ganador-${numeroPartido}"]:checked`
      );

    const resultado =
      document.querySelector(
        `input[name="resultado-${numeroPartido}"]:checked`
      );

    if (!ganador) {
      alert(
        `Elegí al ganador del Partido ${numeroPartido}.`
      );

      mostrarPartidoConError(indice);

      return;
    }

    if (!resultado) {
      alert(
        `Elegí el marcador del Partido ${numeroPartido}.`
      );

      mostrarPartidoConError(indice);

      return;
    }

    const rondas = {};

    for (const ronda of rondasCuartos) {
      const seleccion =
        leerRonda(
          numeroPartido,
          ronda
        );

      if (!seleccion.mvp) {
        alert(
          `Elegí el MVP de ${ronda.nombre} en el Partido ${numeroPartido}.`
        );

        mostrarPartidoConError(indice);

        return;
      }

      if (!seleccion.hipercargas) {
        alert(
          `Elegí las hipercargas de ${ronda.nombre} en el Partido ${numeroPartido}.`
        );

        mostrarPartidoConError(indice);

        return;
      }

      rondas[ronda.id] = {
        mvp: seleccion.mvp.value,
        hipercargas:
          seleccion.hipercargas.value
      };
    }

    datos.predicciones.push({
      partido: numeroPartido,

      ganador: ganador.value,

      resultado: resultado.value,

      rondas
    });
  }

  try {
    botonEnviar.disabled = true;
    botonEnviar.textContent =
      "ENVIANDO...";

    await addDoc(
      collection(db, "predicciones"),
      datos
    );

    alert(
      "✅ Predicciones de Cuartos enviadas correctamente."
    );

    location.reload();

  } catch (error) {
    console.error(
      "Error al enviar las predicciones:",
      error
    );

    alert(
      "❌ No se pudieron enviar las predicciones."
    );

    botonEnviar.disabled = false;
    botonEnviar.textContent =
      "ENVIAR PREDICCIONES";
  }
}

/* =========================
   FUNCIÓN GLOBAL
========================= */

window.enviarPredicciones =
  enviarPredicciones;

console.log(
  "SCRIPT DE CUARTOS LISTO"
);         
