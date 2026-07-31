console.log("PANEL CUARTOS V1");

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

import {
  cuartos,
  opcionesHipercargas,
  rondasCuartos
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
   OPCIONES DE MVP
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
        name="admin-mvp-${numeroPartido}-${rondaId}"
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
   OPCIONES DE HIPERCARGAS
========================= */

function crearOpcionesHipercargas(
  numeroPartido,
  rondaId
) {
  return opcionesHipercargas.map((opcion) => `
    <label class="hipercarga-card">

      <input
        type="radio"
        name="admin-hipercargas-${numeroPartido}-${rondaId}"
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

function crearRondasAdmin(
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
                Resultado puntuable
              </span>
            `
            : `
              <span class="ronda-sin-puntos">
                Opcional · No suma puntos
              </span>
            `
        }

      </div>

      <p class="opcion-titulo">
        ⭐ MVP oficial de la ronda
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
        ⚡ Hipercargas oficiales de la ronda
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
   CREAR PARTIDOS
========================= */

function cargarPartidos() {
  contenedor.innerHTML = "";

  cuartos.forEach((partido, indice) => {
    const numeroPartido = indice + 1;

    const equipo1 = partido[0];
    const equipo2 = partido[1];

    contenedor.insertAdjacentHTML(
      "beforeend",
      `
        <article
          class="partido partido-cuartos admin-partido"
          data-partido="${numeroPartido}"
        >

          <h2 class="partido-titulo">
            🏆 CUARTOS — PARTIDO ${numeroPartido}
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

          <p class="opcion-titulo">
            🎯 Marcador oficial
          </p>

          <div class="resultado-opciones">

            <label class="score-card">

              <input
                type="radio"
                name="admin-resultado-${numeroPartido}"
                value="2-0"
              >

              <span>2 - 0</span>

            </label>

            <label class="score-card">

              <input
                type="radio"
                name="admin-resultado-${numeroPartido}"
                value="2-1"
              >

              <span>2 - 1</span>

            </label>

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
   MARCAR RADIO
========================= */

function marcarRadio(nombre, valor) {
  if (valor === undefined || valor === null) {
    return;
  }

  const opciones = document.querySelectorAll(
    `input[name="${nombre}"]`
  );

  opciones.forEach((opcion) => {
    if (opcion.value === String(valor)) {
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
      "cuartos"
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
      const numeroPartido =
        Number(resultado.partido);

      if (
        numeroPartido < 1 ||
        numeroPartido > cuartos.length
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

      rondasCuartos.forEach((ronda) => {
        const datosRonda =
          resultado.rondas?.[ronda.id];

        if (!datosRonda) {
          return;
        }

        marcarRadio(
          `admin-mvp-${numeroPartido}-${ronda.id}`,
          datosRonda.mvp
        );

        marcarRadio(
          `admin-hipercargas-${numeroPartido}-${ronda.id}`,
          datosRonda.hipercargas
        );
      });
    });

    mensajePanel.textContent =
      "✅ Resultados de Cuartos cargados.";

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
   LEER RONDA
========================= */

function leerRonda(
  numeroPartido,
  rondaId
) {
  const mvp = document.querySelector(
    `input[name="admin-mvp-${numeroPartido}-${rondaId}"]:checked`
  );

  const hipercargas = document.querySelector(
    `input[name="admin-hipercargas-${numeroPartido}-${rondaId}"]:checked`
  );

  return {
    mvp,
    hipercargas
  };
}

/* =========================
   MOSTRAR PARTIDO CON ERROR
========================= */

function mostrarPartidoConError(indice) {
  const tarjetas =
    document.querySelectorAll(".admin-partido");

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
   GUARDAR RESULTADOS
========================= */

async function guardarResultados() {
  const boton =
    document.getElementById("btn-resultados");

  const resultados = [];

  for (
    let indice = 0;
    indice < cuartos.length;
    indice++
  ) {
    const numeroPartido = indice + 1;

    const ganador = document.querySelector(
      `input[name="admin-ganador-${numeroPartido}"]:checked`
    );

    const resultado = document.querySelector(
      `input[name="admin-resultado-${numeroPartido}"]:checked`
    );

    /*
      Si no se eligió ganador ni marcador,
      el partido todavía no terminó.
    */

    if (!ganador && !resultado) {
      continue;
    }

    if (!ganador || !resultado) {
      alert(
        `Completa el ganador y el marcador del Partido ${numeroPartido}.`
      );

      mostrarPartidoConError(indice);

      return;
    }

    const rondas = {};

    for (const ronda of rondasCuartos) {
      const seleccion = leerRonda(
        numeroPartido,
        ronda.id
      );

      /*
        Ronda 1 y Ronda 2 son obligatorias.
      */

      if (ronda.sumaPuntos) {
        if (!seleccion.mvp) {
          alert(
            `Selecciona el MVP oficial de ${ronda.nombre} en el Partido ${numeroPartido}.`
          );

          mostrarPartidoConError(indice);

          return;
        }

        if (!seleccion.hipercargas) {
          alert(
            `Selecciona las hipercargas oficiales de ${ronda.nombre} en el Partido ${numeroPartido}.`
          );

          mostrarPartidoConError(indice);

          return;
        }

        rondas[ronda.id] = {
          mvp: seleccion.mvp.value,
          hipercargas:
            seleccion.hipercargas.value
        };

        continue;
      }

      /*
        La Ronda 3 puede quedar completamente vacía.
        Si se completa un dato, deben completarse ambos.
      */

      if (!seleccion.mvp && !seleccion.hipercargas) {
        continue;
      }

      if (!seleccion.mvp || !seleccion.hipercargas) {
        alert(
          `Completa MVP e hipercargas de ${ronda.nombre}, o deja ambos vacíos.`
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

    resultados.push({
      partido: numeroPartido,
      ganador: ganador.value,
      resultado: resultado.value,
      rondas
    });
  }

  if (resultados.length === 0) {
    alert(
      "Selecciona al menos un resultado oficial."
    );

    return;
  }

  try {
    boton.disabled = true;
    boton.textContent = "GUARDANDO...";

    await setDoc(
      doc(db, "resultados", "cuartos"),
      {
        fase: "cuartos",
        resultados,

        actualizado:
          new Date().toLocaleString("es-AR")
      }
    );

    mensajePanel.textContent =
      `✅ ${resultados.length} resultado(s) de Cuartos guardado(s).`;

    alert(
      "✅ Resultados oficiales de Cuartos guardados."
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

    const snap = await getDoc(referencia);

    if (!snap.exists()) {
      return;
    }

    document.getElementById(
      "estadoPredicciones"
    ).checked =
      snap.data().abiertas === true;

  } catch (error) {
    console.error(
      "Error al cargar estado:",
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
        abiertas,
        faseActiva: "cuartos"
      },
      {
        merge: true
      }
    );

    alert(
      abiertas
        ? "✅ Predicciones de Cuartos abiertas."
        : "🔒 Predicciones de Cuartos cerradas."
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

    boton.textContent =
      "GUARDAR ESTADO";
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

console.log("PANEL CUARTOS LISTO");
