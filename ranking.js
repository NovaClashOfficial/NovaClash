import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

/* =========================
   CALCULAR PUNTOS
========================= */

function calcularPuntos(predicciones, resultadosOficiales) {
  let puntos = 0;
  let aciertosGanador = 0;
  let marcadoresExactos = 0;

  predicciones.forEach((prediccion) => {
    const oficial = resultadosOficiales.find(
      (resultado) =>
        Number(resultado.partido) === Number(prediccion.partido)
    );

    if (!oficial) return;

    const ganadorCorrecto =
      prediccion.ganador === oficial.ganador;

    const marcadorCorrecto =
      prediccion.resultado === oficial.resultado;

    if (ganadorCorrecto) {
      puntos += 2;
      aciertosGanador++;

      if (marcadorCorrecto) {
        puntos += 1;
        marcadoresExactos++;
      }
    }
  });

  return {
    puntos,
    aciertosGanador,
    marcadoresExactos
  };
}

/* =========================
   CARGAR RANKING
========================= */

async function cargarRanking() {
  const contenedor = document.getElementById("ranking");

  contenedor.innerHTML = "<p>Cargando ranking...</p>";

  try {
    const resultadosSnap = await getDoc(
      doc(db, "resultados", "octavos")
    );

    if (!resultadosSnap.exists()) {
      contenedor.innerHTML = `
        <div class="partido">
          <h2>⏳ Ranking pendiente</h2>
          <p>Todavía no hay resultados oficiales cargados.</p>
        </div>
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
        <div class="partido">
          <h2>⏳ Ranking pendiente</h2>
          <p>Todavía no hay partidos finalizados.</p>
        </div>
      `;

      return;
    }

    const prediccionesSnap = await getDocs(
      collection(db, "predicciones")
    );

    const jugadores = [];

    prediccionesSnap.forEach((documento) => {
      const data = documento.data();

      if (
        !data.nombre ||
        !Array.isArray(data.predicciones) ||
        data.fase !== "octavos"
      ) {
        return;
      }

      const estadisticas = calcularPuntos(
        data.predicciones,
        resultadosOficiales
      );

      jugadores.push({
        nombre: data.nombre,
        puntos: estadisticas.puntos,
        aciertosGanador: estadisticas.aciertosGanador,
        marcadoresExactos: estadisticas.marcadoresExactos
      });
    });

    jugadores.sort((a, b) => {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }

      if (b.marcadoresExactos !== a.marcadoresExactos) {
        return b.marcadoresExactos - a.marcadoresExactos;
      }

      return b.aciertosGanador - a.aciertosGanador;
    });

    contenedor.innerHTML = "";

    if (jugadores.length === 0) {
      contenedor.innerHTML =
        "<p>No hay participantes de Octavos todavía.</p>";

      return;
    }

    jugadores.forEach((jugador, i) => {
      let medalla = "";

      if (i === 0) medalla = "🥇";
      else if (i === 1) medalla = "🥈";
      else if (i === 2) medalla = "🥉";

      contenedor.insertAdjacentHTML("beforeend", `
        <article class="partido ranking-card">

          <h2>
            ${medalla} #${i + 1}
            ${escaparHTML(jugador.nombre)}
          </h2>

          <p class="ranking-puntos">
            ${jugador.puntos} puntos
          </p>

          <p>
            Ganadores acertados:
            ${jugador.aciertosGanador}
          </p>

          <p>
            Marcadores exactos:
            ${jugador.marcadoresExactos}
          </p>

        </article>
      `);
    });

  } catch (error) {
    console.error("Error al cargar ranking:", error);

    contenedor.innerHTML =
      "<p>❌ Error al cargar el ranking.</p>";
  }
}

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

cargarRanking();
