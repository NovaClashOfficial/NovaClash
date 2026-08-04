console.log("PICK'EM GRAN FINAL V1");

import {
  collection,
  addDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

import {
  finalistas,
  marcadoresFinal,
  rondasFinal
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

    const snap =
      await getDoc(referencia);

    if (
      snap.exists() &&
      snap.data().abiertas === false
    ) {
      document.getElementById(
        "partidos"
      ).innerHTML = `
        <div class="predicciones-cerradas">

          <h2>
            🔒 Las predicciones están cerradas
          </h2>

          <p>
            Ya no se pueden enviar predicciones
            de la Gran Final.
          </p>

        </div>
      `;

      const nombre =
        document.getElementById("nombre");

      const boton =
        document.getElementById(
          "btn-enviar"
        );

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

    document.getElementById(
      "partidos"
    ).innerHTML = `
      <div class="predicciones-cerradas">

        <h2>❌ Error</h2>

        <p>
          No se pudo comprobar el estado
          de las predicciones.
        </p>

      </div>
    `;

    return false;
  }
}

/* =========================
   RONDAS SEGÚN MARCADOR
========================= */

function cantidadRondasJugadas(marcador) {
  const cantidades = {
    "3-0": 3,
    "3-1": 4,
    "3-2": 5
  };

  return cantidades[marcador] || 0;
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

        ${equipo.jugadores.map(
          (jugador) => `
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
          `
        ).join("")}

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
  return rondasFinal.map(
    (ronda, indice) => `
      <section
        class="
          ronda-prediccion
          ronda-final
          ${
            ronda.desempate
              ? "ronda-desempate"
              : ""
          }
        "
        data-numero-ronda="${indice + 1}"
      >

        <div class="ronda-encabezado">

          <h3>
            ${escaparHTML(ronda.nombre)}
          </h3>

          ${
            ronda.desempate
              ? `
                <span class="ronda-sin-puntos">
                  Solo si el marcador es 3-2
                </span>
              `
              : `
                <span class="ronda-puntos">
                  +2 puntos
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
    `
  ).join("");
}

/* =========================
   ACTUALIZAR RONDAS VISIBLES
========================= */

function actualizarRondasVisibles(
  numeroPartido,
  marcador
) {
  const cantidad =
    cantidadRondasJugadas(marcador);

  const partido =
    document.querySelector(
      `[data-partido="${numeroPartido}"]`
    );

  if (!partido) {
    return;
  }

  const rondas =
    partido.querySelectorAll(
      ".ronda-final"
    );

  rondas.forEach((ronda) => {
    const numeroRonda =
      Number(
        ronda.dataset.numeroRonda
      );

    const visible =
      numeroRonda <= cantidad;

    ronda.classList.toggle(
      "ronda-oculta",
      !visible
    );

    if (!visible) {
      ronda
        .querySelectorAll(
          'input[type="radio"]'
        )
        .forEach((radio) => {
          radio.checked = false;
        });
    }
  });
}

/* =========================
   ACTIVAR EVENTOS DE MARCADOR
========================= */

function activarEventosMarcador() {
  const opciones =
    document.querySelectorAll(
      'input[name^="resultado-"]'
    );

  opciones.forEach((opcion) => {
    opcion.addEventListener(
      "change",
      () => {
        const numeroPartido =
          Number(
            opcion.name.replace(
              "resultado-",
              ""
            )
          );

        actualizarRondasVisibles(
          numeroPartido,
          opcion.value
        );
      }
    );
  });
}

/* =========================
   CARGAR GRAN FINAL
========================= */

window.addEventListener(
  "DOMContentLoaded",
  async () => {
    const abiertas =
      await verificarEstadoPredicciones();

    if (!abiertas) {
      return;
    }

    const contenedor =
      document.getElementById(
        "partidos"
      );

    contenedor.innerHTML = "";

    finalistas.forEach(
      (partido, indice) => {
        const numeroPartido =
          indice + 1;

        const equipo1 =
          partido[0];

        const equipo2 =
          partido[1];

        contenedor.insertAdjacentHTML(
          "beforeend",
          `
            <article
              class="
                partido
                partido-final
              "
              data-partido="${numeroPartido}"
            >

              <div class="final-corona">
                👑
              </div>

              <h2 class="partido-titulo final-titulo">
                🏆 GRAN FINAL
              </h2>

              <p class="final-enfrentamiento">
                ${escaparHTML(equipo1.nombre)}
                <span>VS</span>
                ${escaparHTML(equipo2.nombre)}
              </p>

              <div class="final-puntuacion">

                <span>
                  Ganador: +10
                </span>

                <span>
                  Marcador: +5
                </span>

                <span>
                  Cada estelar: +2
                </span>

              </div>

              <p class="opcion-titulo">
                Elegí al campeón de Nova Clash
              </p>

              <div class="seleccion-equipos">

                <label class="team-card team-final">

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

                <label class="team-card team-final">

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

                  ${marcadoresFinal.map(
                    (marcador) => `
                      <label class="score-card score-final">

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

        actualizarRondasVisibles(
          numeroPartido,
          ""
        );
      }
    );

    activarEventosMarcador();
  }
);

/* =========================
   MOSTRAR ERROR
========================= */

function mostrarPartidoConError(
  indice
) {
  const tarjetas =
    document.querySelectorAll(
      ".partido-final"
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
    document.getElementById(
      "nombre"
    );

  const botonEnviar =
    document.getElementById(
      "btn-enviar"
    );

  const nombre =
    inputNombre.value.trim();

  if (!nombre) {
    alert(
      "Escribí tu nombre o Nick."
    );

    inputNombre.focus();

    return;
  }

  const datos = {
    nombre,

    fecha:
      new Date().toLocaleString(
        "es-AR"
      ),

    fase: "final",

    predicciones: []
  };

  for (
    let indice = 0;
    indice < finalistas.length;
    indice++
  ) {
    const numeroPartido =
      indice + 1;

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
        "Elegí al campeón de Nova Clash."
      );

      mostrarPartidoConError(
        indice
      );

      return;
    }

    if (!resultado) {
      alert(
        "Elegí el marcador de la Gran Final."
      );

      mostrarPartidoConError(
        indice
      );

      return;
    }

    const rondasJugadas =
      cantidadRondasJugadas(
        resultado.value
      );

    const rondas = {};

    for (
      let numeroRonda = 1;
      numeroRonda <= rondasJugadas;
      numeroRonda++
    ) {
      const ronda =
        rondasFinal[
          numeroRonda - 1
        ];

      const estelar =
        leerEstelar(
          numeroPartido,
          ronda.id
        );

      if (!estelar) {
        alert(
          `Elegí el estelar de ${ronda.nombre}.`
        );

        mostrarPartidoConError(
          indice
        );

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
      collection(
        db,
        "predicciones"
      ),
      datos
    );

    alert(
      "✅ Predicción de la Gran Final enviada correctamente."
    );

    location.reload();

  } catch (error) {
    console.error(
      "Error al enviar la predicción:",
      error
    );

    alert(
      "❌ No se pudo enviar la predicción."
    );

    botonEnviar.disabled = false;

    botonEnviar.textContent =
      "ENVIAR PREDICCIÓN";
  }
}

/* =========================
   FUNCIÓN GLOBAL
========================= */

window.enviarPredicciones =
  enviarPredicciones;

console.log(
  "PICK'EM GRAN FINAL LISTO"
);
