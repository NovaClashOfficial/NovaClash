console.log("PICK'EM SEMIFINALES V1");

import {
  collection,
  addDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

import {
  semifinales,
  marcadoresSemifinales,
  rondasSemifinales
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
            Ya no se pueden enviar predicciones de Semifinales.
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
   OPCIONES DE ESTELAR
========================= */

function crearGrupoEstelar(
  numeroPartido,
  rondaId,
  equipo
) {
  return `
    <div class="estelar-grupo">

      <div class="estelar-equipo-titulo">
        ⭐ ${escaparHTML(equipo.nombre)}
      </div>

      <div class="estelar-jugadores">

        ${equipo.jugadores.map((jugador) => `
          <label class="estelar-card">

            <input
              type="radio"
              name="estelar-${numeroPartido}-${rondaId}"
              value="${escaparHTML(jugador)}"
            >

            <span>
              ${escaparHTML(jugador)}
            </span>

          </label>
        `).join("")}

      </div>

    </div>
  `;
}

function crearOpcionesEstelar(
  numeroPartido,
  rondaId,
  equipo1,
  equipo2
) {
  return `
    ${crearGrupoEstelar(
      numeroPartido,
      rondaId,
      equipo1
    )}

    <div class="estelar-separador">
      VS
    </div>

    ${crearGrupoEstelar(
      numeroPartido,
      rondaId,
      equipo2
    )}
  `;
}

/* =========================
   CREAR RONDAS
========================= */

function crearRondas(
  numeroPartido,
  equipo1,
  equipo2
) {
  return rondasSemifinales.map((ronda) => `
    <section
      class="ronda-prediccion ${
        ronda.desempate
          ? "ronda-desempate"
          : ""
      }"
    >

      <div class="ronda-encabezado">

        <h3>
          ${escaparHTML(ronda.nombre)}
        </h3>

        ${
          ronda.desempate
            ? `
              <span class="ronda-sin-puntos">
                Se puntúa solo si se juega
              </span>
            `
            : `
              <span class="ronda-puntos">
                +1 punto
              </span>
            `
        }

      </div>

      <p class="opcion-titulo">
        ⭐ Elegí al jugador estelar
      </p>

      <div class="estelar-opciones">

        ${crearOpcionesEstelar(
          numeroPartido,
          ronda.id,
          equipo1,
          equipo2
        )}

      </div>

    </section>
  `).join("");
}

/* =========================
   CARGAR SEMIFINALES
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

    semifinales.forEach((partido, indice) => {
      const numeroPartido = indice + 1;

      const equipo1 = partido[0];
      const equipo2 = partido[1];

      contenedor.insertAdjacentHTML(
        "beforeend",
        `
          <article
            class="partido partido-semifinal"
            data-partido="${numeroPartido}"
          >

            <h2 class="partido-titulo">
              🔥 SEMIFINAL — PARTIDO ${numeroPartido}
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

                ${marcadoresSemifinales.map(
                  (marcador) => `
                    <label class="score-card">

                      <input
                        type="radio"
                        name="resultado-${numeroPartido}"
                        value="${escaparHTML(marcador)}"
                      >

                      <span>
                        ${escaparHTML(marcador)}
                      </span>

                    </label>
                  `
                ).join("")}

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
   MOSTRAR ERROR
========================= */

function mostrarPartidoConError(indice) {
  const tarjetas =
    document.querySelectorAll(
      ".partido-semifinal"
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
   LEER ESTELAR
========================= */

function leerEstelar(
  numeroPartido,
  rondaId
) {
  return document.querySelector(
    `input[name="estelar-${numeroPartido}-${rondaId}"]:checked`
  );
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

    fase: "semifinales",

    predicciones: []
  };

  for (
    let indice = 0;
    indice < semifinales.length;
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

    for (const ronda of rondasSemifinales) {
      const estelar =
        leerEstelar(
          numeroPartido,
          ronda.id
        );

      if (!estelar) {
        alert(
          `Elegí el estelar de ${ronda.nombre} en el Partido ${numeroPartido}.`
        );

        mostrarPartidoConError(indice);

        return;
      }

      rondas[ronda.id] = {
        estelar: estelar.value
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
      "✅ Predicciones de Semifinales enviadas correctamente."
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
  "SCRIPT DE SEMIFINALES LISTO"
);
