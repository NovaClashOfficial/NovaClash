console.log("RANKING OCTAVOS V2");

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

/* =========================
   EVITAR HTML EN NOMBRES
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
   CALCULAR PUNTOS
========================= */

function calcularPuntos(
  predicciones,
  resultadosOficiales
) {
  let puntos = 0;
  let ganadoresAcertados = 0;
  let resultadosExactos = 0;

  predicciones.forEach((prediccion) => {
    const resultadoReal =
      resultadosOficiales.find(
        (resultado) =>
          Number(resultado.partido) ===
          Number(prediccion.partido)
      );

    if (!resultadoReal) {
      return;
    }

    const ganadorCorrecto =
      prediccion.ganador ===
      resultadoReal.ganador;

    const marcadorCorrecto =
      prediccion.resultado ===
      resultadoReal.resultado;

    if (ganadorCorrecto) {
      puntos += 2;
      ganadoresAcertados++;

      if (marcadorCorrecto) {
        puntos += 1;
        resultadosExactos++;
      }
    }
  });

  return {
    puntos,
    ganadoresAcertados,
    resultadosExactos
  };
}

/* =========================
   CARGAR RANKING
========================= */

async function cargarRanking() {
  const contenedor =
    document.getElementById("ranking");

  contenedor.innerHTML =
    "<p>Cargando ranking...</p>";

  try {
    const resultadosSnap = await getDoc(
      doc(db, "resultados", "octavos")
    );

    if (!resultadosSnap.exists()) {
      contenedor.innerHTML = `
        <article class="partido">
          <h2>⏳ Ranking pendiente</h2>
          <p>
            Todavía no hay resultados oficiales.
          </p>
        </article>
      `;

      return;
    }

    const resultadosOficiales =
      resultadosSnap.data().resultados;

    if (
      !Array.isArray(resultadosOficiales) ||
      resultadosOficiales.length === 0
    ) {
      contenedor.innerHTML = `
        <article class="partido">
          <h2>⏳ Ranking pendiente</h2>
          <p>
            Todavía no terminó ningún partido.
          </p>
        </article>
      `;

      return;
    }

    const prediccionesSnap = await getDocs(
      collection(db, "predicciones")
    );

    const jugadores = [];

    prediccionesSnap.forEach((documento) => {
      const datos = documento.data();

      if (!datos.nombre) {
        return;
      }

      if (!Array.isArray(datos.predicciones)) {
        return;
      }

      if (datos.fase !== "octavos") {
        return;
      }

      const estadisticas = calcularPuntos(
        datos.predicciones,
        resultadosOficiales
      );

      jugadores.push({
        nombre: datos.nombre,
        puntos: estadisticas.puntos,
        ganadoresAcertados:
          estadisticas.ganadoresAcertados,
        resultadosExactos:
          estadisticas.resultadosExactos
      });
    });

    jugadores.sort((a, b) => {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }

      if (
        b.resultadosExactos !==
        a.resultadosExactos
      ) {
        return (
          b.resultadosExactos -
          a.resultadosExactos
        );
      }

      return (
        b.ganadoresAcertados -
        a.ganadoresAcertados
      );
    });

    contenedor.innerHTML = "";

    if (jugadores.length === 0) {
      contenedor.innerHTML = `
        <article class="partido">
          <h2>Sin participantes</h2>
          <p>
            Todavía no hay predicciones de Octavos.
          </p>
        </article>
      `;

      return;
    }

    jugadores.forEach((jugador, i) => {
      let medalla = "";

      if (i === 0) medalla = "🥇";
      else if (i === 1) medalla = "🥈";
      else if (i === 2) medalla = "🥉";

      contenedor.insertAdjacentHTML(
        "beforeend",
        `
          <article class="partido ranking-card">

            <h2>
              ${medalla} #${i + 1}
              ${escaparHTML(jugador.nombre)}
            </h2>

            <p>
              <strong>
                ${jugador.puntos} puntos
              </strong>
            </p>

            <p>
              Ganadores acertados:
              ${jugador.ganadoresAcertados}
            </p>

            <p>
              Resultados exactos:
              ${jugador.resultadosExactos}
            </p>

          </article>
        `
      );
    });

  } catch (error) {
    console.error(
      "Error al cargar ranking:",
      error
    );

    contenedor.innerHTML = `
      <article class="partido">
        <h2>❌ Error</h2>
        <p>
          No se pudo cargar el ranking.
        </p>
      </article>
    `;
  }
}

cargarRanking();

console.log("RANKING OCTAVOS LISTO");
