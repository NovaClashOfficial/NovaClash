console.log("PANEL SEMIFINALES V1");

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
  semifinales,
  marcadoresSemifinales,
  rondasSemifinales
} from "./equipos.js";

const contenedor =
  document.getElementById("adminPartidos");

const mensajePanel =
  document.getElementById("mensaje-panel");

/* =========================
   PROTEGER PANEL
========================= */

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    window.location.href = "login.html";
  }
});

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
   CREAR GRUPO DE ESTELARES
========================= */

function crearGrupoEstelar(
  numeroPartido,
  rondaId,
  equipo
) {
  const jugadores = equipo.jugadores.map(
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
   CREAR OPCIONES DE ESTELAR
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
  return rondasSemifinales.map((ronda) => `
    <section
      class="
        ronda-prediccion
        ronda-admin
        ${ronda.desempate ? "ronda-desempate" : ""}
      "
      data-partido="${numeroPartido}"
      data-ronda="${ronda.id}"
    >

      <div class="ronda-encabezado">

        <h3>
          ${escaparHTML(ronda.nombre)}
        </h3>

        ${
          ronda.desempate
            ? `
              <span class="ronda-sin-puntos">
                Solo si hubo desempate
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
  `).join("");
}

/* =========================
   CREAR PARTIDOS
========================= */

function cargarPartidos() {
  contenedor.innerHTML = "";

  semifinales.forEach((partido, indice) => {
    const numeroPartido = indice + 1;

    const equipo1 = partido[0];
    const equipo2 = partido[1];

    contenedor.insertAdjacentHTML(
      "beforeend",
      `
        <article
          class="partido partido-semifinal admin-partido"
          data-partido="${numeroPartido}"
        >

          <h2 class="partido-titulo">
            🔥 SEMIFINAL — PARTIDO ${numeroPartido}
          </h2>

          <p class="opcion-titulo">
            Ganador oficial
          </p>

          <div class="seleccion-equipos">

            <label class="team-card">

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

            <label class="team-card">

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

              ${marcadoresSemifinales.map(
                (marcador) => `
                  <label class="score-card">

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
  });
}

/* =========================
   MARCAR RADIO GUARDADO
========================= */

function marcarRadio(nombre, valor) {
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
      opcion.value === String(valor);
  });
}

/* =========================
   RONDAS SEGÚN EL MARCADOR
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
   RESALTAR PARTIDO CON ERROR
========================= */

function mostrarPartidoConError(indice) {
  const tarjetas =
    document.querySelectorAll(
      ".admin-partido"
    );

  const tarjeta = tarjetas[indice];

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
   CARGAR RESULTADOS GUARDADOS
========================= */

async function cargarResultadosGuardados() {
  try {
    const referencia = doc(
      db,
      "resultados",
      "semifinales"
    );

    const snap =
      await getDoc(referencia);

    if (!snap.exists()) {
      return;
    }

    const datos = snap.data();

    if (!Array.isArray(datos.resultados)) {
      return;
    }

    datos.resultados.forEach((resultado) => {
      const numeroPartido =
        Number(resultado.partido);

      if (
        numeroPartido < 1 ||
        numeroPartido > semifinales.length
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

      rondasSemifinales.forEach((ronda) => {
        const resultadoRonda =
          resultado.rondas?.[ronda.id];

        if (!resultadoRonda?.estelar) {
          return;
        }

        marcarRadio(
          `admin-estelar-${numeroPartido}-${ronda.id}`,
          resultadoRonda.estelar
        );
      });
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
  const boton =
    document.getElementById(
      "btn-resultados"
    );

  const resultadosOficiales = [];

  for (
    let indice = 0;
    indice < semifinales.length;
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

    /*
      Permite guardar una semifinal primero
      y dejar la otra completamente vacía.
    */

    if (!ganador && !marcador) {
      continue;
    }

    if (!ganador || !marcador) {
      alert(
        `Completá el ganador y el marcador de la Semifinal ${numeroPartido}.`
      );

      mostrarPartidoConError(indice);

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
          `Seleccioná el jugador estelar de la Ronda ${numeroRonda} en la Semifinal ${numeroPartido}.`
        );

        mostrarPartidoConError(indice);

        return;
      }

      rondas[rondaId] = {
        estelar: estelar.value
      };
    }

    resultadosOficiales.push({
      partido: numeroPartido,
      ganador: ganador.value,
      resultado: marcador.value,
      rondas
    });
  }

  if (resultadosOficiales.length === 0) {
    alert(
      "Seleccioná al menos un resultado oficial."
    );

    return;
  }

  try {
    boton.disabled = true;

    boton.textContent =
      "GUARDANDO...";

    await setDoc(
      doc(
        db,
        "resultados",
        "semifinales"
      ),
      {
        fase: "semifinales",

        resultados:
          resultadosOficiales,

        actualizado:
          new Date().toLocaleString(
            "es-AR"
          )
      }
    );

    mensajePanel.textContent =
      `✅ ${resultadosOficiales.length} semifinal(es) guardada(s).`;

    alert(
      "✅ Resultados oficiales de Semifinales guardados."
    );

  } catch (error) {
    console.error(
      "Error al guardar resultados:",
      error
    );

    mensajePanel.textContent =
      "❌ Error al guardar los resultados.";

    alert(
      "❌ No se pudieron guardar los resultados."
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
        faseActiva: "semifinales"
      },
      {
        merge: true
      }
    );

    alert(
      abiertas
        ? "✅ Predicciones de Semifinales abiertas."
        : "🔒 Predicciones de Semifinales cerradas."
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
  "PANEL SEMIFINALES LISTO"
);
