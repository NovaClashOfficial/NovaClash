console.log("PANEL GRAN FINAL V1");

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase.js";

import {
  finalistas,
  marcadoresFinal,
  rondasFinal
} from "./equipos.js";

const contenedor =
  document.getElementById(
    "adminPartidos"
  );

const mensajePanel =
  document.getElementById(
    "mensaje-panel"
  );

/* =========================
   PROTEGER PANEL
========================= */

onAuthStateChanged(
  auth,
  (usuario) => {
    if (!usuario) {
      window.location.href =
        "login.html";
    }
  }
);

/* =========================
   ESCAPAR HTML
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
   RONDAS SEGÚN MARCADOR
========================= */

function cantidadRondasJugadas(
  marcador
) {
  const cantidades = {
    "3-0": 3,
    "3-1": 4,
    "3-2": 5
  };

  return cantidades[marcador] || 0;
}

/* =========================
   CREAR GRUPO DE ESTELARES
========================= */

function crearGrupoEstelar(
  numeroPartido,
  rondaId,
  equipo
) {
  const jugadores =
    equipo.jugadores.map(
      (jugador) => `
        <label class="estelar-card">

          <input
            type="radio"
            name="admin-estelar-${numeroPartido}-${rondaId}"
            value="${escaparHTML(jugador)}"
          >

          <span>
            ${escaparHTML(jugador)}
          </span>

        </label>
      `
    ).join("");

  return `
    <div class="estelar-grupo">

      <div class="estelar-equipo-titulo">
        ⭐ ${escaparHTML(equipo.nombre)}
      </div>

      <div class="estelar-jugadores">
        ${jugadores}
      </div>

    </div>
  `;
}

/* =========================
   OPCIONES DE ESTELAR
========================= */

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
   CREAR RONDAS DEL PANEL
========================= */

function crearRondasAdmin(
  numeroPartido,
  equipo1,
  equipo2
) {
  return rondasFinal.map(
    (ronda, indice) => `
      <section
        class="
          ronda-prediccion
          ronda-admin
          ${
            ronda.desempate
              ? "ronda-desempate"
              : ""
          }
        "
        data-partido="${numeroPartido}"
        data-ronda="${ronda.id}"
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
                  Solo si el marcador fue 3-2
                </span>
              `
              : `
                <span class="ronda-puntos">
                  Resultado oficial
                </span>
              `
          }

        </div>

        <p class="opcion-titulo">
          ⭐ Jugador estelar oficial
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
    cantidadRondasJugadas(
      marcador
    );

  const partido =
    document.querySelector(
      `[data-partido="${numeroPartido}"]`
    );

  if (!partido) {
    return;
  }

  const rondas =
    partido.querySelectorAll(
      ".ronda-admin"
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
   CREAR PARTIDO
========================= */

function cargarPartidos() {
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
              admin-partido
            "
            data-partido="${numeroPartido}"
          >

            <div class="final-corona">
              👑
            </div>

            <h2 class="partido-titulo final-titulo">
              🏆 RESULTADO OFICIAL DE LA GRAN FINAL
            </h2>

            <p class="final-enfrentamiento">
              ${escaparHTML(equipo1.nombre)}
              <span>VS</span>
              ${escaparHTML(equipo2.nombre)}
            </p>

            <p class="opcion-titulo">
              Campeón oficial
            </p>

            <div class="seleccion-equipos">

              <label class="team-card team-final">

                <input
                  type="radio"
                  name="admin-ganador-${numeroPartido}"
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
                  name="admin-ganador-${numeroPartido}"
                  value="${escaparHTML(equipo2.nombre)}"
                >

                <span class="team-card-nombre">
                  ${escaparHTML(equipo2.nombre)}
                </span>

              </label>

            </div>

            <div class="resultado-contenedor">

              <p class="opcion-titulo">
                🎯 Marcador oficial
              </p>

              <div class="resultado-opciones">

                ${marcadoresFinal.map(
                  (marcador) => `
                    <label class="score-card score-final">

                      <input
                        type="radio"
                        name="admin-resultado-${numeroPartido}"
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

              ${crearRondasAdmin(
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

/* =========================
   EVENTOS DEL MARCADOR
========================= */

function activarEventosMarcador() {
  const opciones =
    document.querySelectorAll(
      'input[name^="admin-resultado-"]'
    );

  opciones.forEach((opcion) => {
    opcion.addEventListener(
      "change",
      () => {
        const numeroPartido =
          Number(
            opcion.name.replace(
              "admin-resultado-",
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
   MARCAR RADIO GUARDADO
========================= */

function marcarRadio(
  nombre,
  valor
) {
  if (
    valor === undefined ||
    valor === null
  ) {
    return;
  }

  const opciones =
    document.querySelectorAll(
      `input[name="${nombre}"]`
    );

  opciones.forEach((opcion) => {
    opcion.checked =
      opcion.value ===
      String(valor);
  });
}

/* =========================
   LEER ESTELAR
========================= */

function leerEstelar(
  numeroPartido,
  rondaId
) {
  return document.querySelector(
    `input[name="admin-estelar-${numeroPartido}-${rondaId}"]:checked`
  );
}

/* =========================
   RESALTAR ERROR
========================= */

function mostrarPartidoConError(
  indice
) {
  const tarjetas =
    document.querySelectorAll(
      ".admin-partido"
    );

  const tarjeta =
    tarjetas[indice];

  tarjeta?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  tarjeta?.classList.add(
    "partido-error"
  );

  setTimeout(() => {
    tarjeta?.classList.remove(
      "partido-error"
    );
  }, 1800);
}

/* =========================
   CARGAR RESULTADO GUARDADO
========================= */

async function cargarResultadosGuardados() {
  try {
    const referencia = doc(
      db,
      "resultados",
      "final"
    );

    const snap =
      await getDoc(referencia);

    if (!snap.exists()) {
      return;
    }

    const datos =
      snap.data();

    if (
      !Array.isArray(
        datos.resultados
      )
    ) {
      return;
    }

    datos.resultados.forEach(
      (resultado) => {
        const numeroPartido =
          Number(
            resultado.partido
          );

        if (
          numeroPartido < 1 ||
          numeroPartido >
            finalistas.length
        ) {
          return;
        }

        marcarRadio(
          `admin-ganador-${numeroPartido}`,
          resultado.ganador
        );

        marcarRadio(
          `admin-resultado-${numeroPartido}`,
          resultado.resultado
        );

        actualizarRondasVisibles(
          numeroPartido,
          resultado.resultado
        );

        rondasFinal.forEach(
          (ronda) => {
            const resultadoRonda =
              resultado.rondas?.[
                ronda.id
              ];

            if (
              !resultadoRonda?.estelar
            ) {
              return;
            }

            marcarRadio(
              `admin-estelar-${numeroPartido}-${ronda.id}`,
              resultadoRonda.estelar
            );
          }
        );
      }
    );

    mensajePanel.textContent =
      "✅ Resultado oficial guardado cargado.";

  } catch (error) {
    console.error(
      "Error al cargar el resultado:",
      error
    );

    mensajePanel.textContent =
      "❌ No se pudo cargar el resultado oficial.";
  }
}

/* =========================
   GUARDAR RESULTADO
========================= */

async function guardarResultados() {
  const boton =
    document.getElementById(
      "btn-resultados"
    );

  const resultadosOficiales = [];

  for (
    let indice = 0;
    indice < finalistas.length;
    indice++
  ) {
    const numeroPartido =
      indice + 1;

    const ganador =
      document.querySelector(
        `input[name="admin-ganador-${numeroPartido}"]:checked`
      );

    const marcador =
      document.querySelector(
        `input[name="admin-resultado-${numeroPartido}"]:checked`
      );

    if (!ganador) {
      alert(
        "Seleccioná al campeón oficial."
      );

      mostrarPartidoConError(
        indice
      );

      return;
    }

    if (!marcador) {
      alert(
        "Seleccioná el marcador oficial."
      );

      mostrarPartidoConError(
        indice
      );

      return;
    }

    const rondasJugadas =
      cantidadRondasJugadas(
        marcador.value
      );

    const rondas = {};

    for (
      let numeroRonda = 1;
      numeroRonda <= rondasJugadas;
      numeroRonda++
    ) {
      const rondaId =
        `ronda${numeroRonda}`;

      const estelar =
        leerEstelar(
          numeroPartido,
          rondaId
        );

      if (!estelar) {
        alert(
          `Seleccioná el jugador estelar de la Ronda ${numeroRonda}.`
        );

        mostrarPartidoConError(
          indice
        );

        return;
      }

      rondas[rondaId] = {
        estelar:
          estelar.value
      };
    }

    resultadosOficiales.push({
      partido:
        numeroPartido,

      ganador:
        ganador.value,

      resultado:
        marcador.value,

      rondas
    });
  }

  try {
    boton.disabled = true;

    boton.textContent =
      "GUARDANDO...";

    await setDoc(
      doc(
        db,
        "resultados",
        "final"
      ),
      {
        fase: "final",

        resultados:
          resultadosOficiales,

        actualizado:
          new Date().toLocaleString(
            "es-AR"
          )
      }
    );

    mensajePanel.textContent =
      "✅ Resultado oficial de la Gran Final guardado.";

    alert(
      "✅ Resultado oficial de la Gran Final guardado."
    );

  } catch (error) {
    console.error(
      "Error al guardar resultado:",
      error
    );

    mensajePanel.textContent =
      "❌ Error al guardar el resultado.";

    alert(
      "❌ No se pudo guardar el resultado oficial."
    );

  } finally {
    boton.disabled = false;

    boton.textContent =
      "GUARDAR RESULTADOS";
  }
}

/* =========================
   CARGAR ESTADO
========================= */

async function cargarEstado() {
  try {
    const referencia = doc(
      db,
      "configuracion",
      "predicciones"
    );

    const snap =
      await getDoc(referencia);

    if (!snap.exists()) {
      return;
    }

    const checkbox =
      document.getElementById(
        "estadoPredicciones"
      );

    checkbox.checked =
      snap.data().abiertas === true;

  } catch (error) {
    console.error(
      "Error al cargar el estado:",
      error
    );
  }
}

/* =========================
   GUARDAR ESTADO
========================= */

async function guardarEstado() {
  const checkbox =
    document.getElementById(
      "estadoPredicciones"
    );

  const boton =
    document.getElementById(
      "btn-estado"
    );

  const abiertas =
    checkbox.checked;

  try {
    boton.disabled = true;

    boton.textContent =
      "GUARDANDO...";

    await setDoc(
      doc(
        db,
        "configuracion",
        "predicciones"
      ),
      {
        abiertas,
        faseActiva: "final"
      },
      {
        merge: true
      }
    );

    alert(
      abiertas
        ? "✅ Predicciones de la Gran Final abiertas."
        : "🔒 Predicciones de la Gran Final cerradas."
    );

  } catch (error) {
    console.error(
      "Error al cambiar el estado:",
      error
    );

    alert(
      "❌ No se pudo cambiar el estado."
    );

  } finally {
    boton.disabled = false;

    boton.textContent =
      "GUARDAR ESTADO";
  }
}

/* =========================
   FUNCIONES GLOBALES
========================= */

window.guardarEstado =
  guardarEstado;

window.guardarResultados =
  guardarResultados;

/* =========================
   INICIAR
========================= */

cargarPartidos();
cargarEstado();
cargarResultadosGuardados();

console.log(
  "PANEL GRAN FINAL LISTO"
);
