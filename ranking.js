console.log("RANKING GENERAL NOVA CLASH");

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

/* =========================
   FUNCIONES AUXILIARES
========================= */

function normalizarNombre(nombre) {
  return String(nombre)
    .trim()
    .toLowerCase();
}

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   PUNTOS DE OCTAVOS
========================= */

function calcularPuntosOctavos(
  predicciones,
  resultadosOficiales
) {
  let puntos = 0;
  let ganadoresAcertados = 0;
  let marcadoresExactos = 0;

  if (!Array.isArray(predicciones)) {
    return {
      puntos,
      ganadoresAcertados,
      marcadoresExactos
    };
  }

  predicciones.forEach((prediccion) => {
    const resultadoReal = resultadosOficiales.find(
      (resultado) =>
        Number(resultado.partido) ===
        Number(prediccion.partido)
    );

    if (!resultadoReal) return;

    const ganadorCorrecto =
      prediccion.ganador === resultadoReal.ganador;

    const marcadorCorrecto =
      prediccion.resultado === resultadoReal.resultado;

    if (ganadorCorrecto) {
      puntos += 2;
      ganadoresAcertados++;

      if (marcadorCorrecto) {
        puntos += 1;
        marcadoresExactos++;
      }
    }
  });

  return {
    puntos,
    ganadoresAcertados,
    marcadoresExactos
  };
}

/* =========================
   CARGAR RANKING GENERAL
========================= */

async function cargarRanking() {
  const contenedor =
    document.getElementById("ranking");

  contenedor.innerHTML =
    "<p>Cargando ranking...</p>";

  try {

    /* =========================
       RESULTADOS DE GRUPOS
    ========================= */

    const clasificadosSnap = await getDocs(
      collection(db, "clasificados")
    );

    const clasificadosOficiales = {};

    clasificadosSnap.forEach((documento) => {
      const datos = documento.data();

      if (
        datos.grupo &&
        Array.isArray(datos.clasificados)
      ) {
        clasificadosOficiales[
          datos.grupo.toUpperCase()
        ] = datos.clasificados;
      }
    });

    /* =========================
       RESULTADOS DE OCTAVOS
    ========================= */

    let resultadosOctavos = [];

    const resultadosOctavosSnap =
      await getDoc(
        doc(db, "resultados", "octavos")
      );

    if (resultadosOctavosSnap.exists()) {
      const datos =
        resultadosOctavosSnap.data();

      if (Array.isArray(datos.resultados)) {
        resultadosOctavos =
          datos.resultados;
      }
    }

    /* =========================
       LEER TODAS LAS PREDICCIONES
    ========================= */

    const prediccionesSnap = await getDocs(
      collection(db, "predicciones")
    );

    const jugadores = {};

    prediccionesSnap.forEach((documento) => {
      const datos = documento.data();

      if (!datos.nombre) return;

      const clave =
        normalizarNombre(datos.nombre);

      if (!clave) return;

      if (!jugadores[clave]) {
        jugadores[clave] = {
          nombre: datos.nombre.trim(),

          puntosGrupos: 0,
          puntosOctavos: 0,

          ganadoresAcertados: 0,
          marcadoresExactos: 0,

          gruposProcesados: new Set(),
          octavosProcesados: new Set()
        };
      }

      const jugador = jugadores[clave];

      /* =========================
         PREDICCIONES DE GRUPOS
      ========================= */

      if (
        datos.predicciones &&
        !Array.isArray(datos.predicciones)
      ) {
        Object.entries(
          datos.predicciones
        ).forEach(([grupo, equipos]) => {
          const grupoNormalizado =
            grupo.toUpperCase();

          const clasificados =
            clasificadosOficiales[
              grupoNormalizado
            ];

          if (
            !Array.isArray(equipos) ||
            !Array.isArray(clasificados)
          ) {
            return;
          }

          /*
            Evita sumar dos veces el mismo grupo
            si el participante lo envió repetido.
          */

          if (
            jugador.gruposProcesados.has(
              grupoNormalizado
            )
          ) {
            return;
          }

          equipos.forEach((equipo) => {
            if (
              clasificados.includes(equipo)
            ) {
              jugador.puntosGrupos += 1;
            }
          });

          jugador.gruposProcesados.add(
            grupoNormalizado
          );
        });
      }

      /* =========================
         PREDICCIONES DE OCTAVOS
      ========================= */

      if (
        datos.fase === "octavos" &&
        Array.isArray(datos.predicciones)
      ) {
        /*
          Se calculan partido por partido para
          evitar duplicar predicciones repetidas.
        */

        datos.predicciones.forEach(
          (prediccion) => {
            const numeroPartido =
              Number(prediccion.partido);

            if (
              jugador.octavosProcesados.has(
                numeroPartido
              )
            ) {
              return;
            }

            const resultadoReal =
              resultadosOctavos.find(
                (resultado) =>
                  Number(resultado.partido) ===
                  numeroPartido
              );

            if (!resultadoReal) return;

            if (
              prediccion.ganador ===
              resultadoReal.ganador
            ) {
              jugador.puntosOctavos += 2;
              jugador.ganadoresAcertados++;

              if (
                prediccion.resultado ===
                resultadoReal.resultado
              ) {
                jugador.puntosOctavos += 1;
                jugador.marcadoresExactos++;
              }
            }

            jugador.octavosProcesados.add(
              numeroPartido
            );
          }
        );
      }
    });

    /* =========================
       CONVERTIR Y ORDENAR
    ========================= */

    const listaJugadores =
      Object.values(jugadores).map(
        (jugador) => ({
          ...jugador,

          puntosTotales:
            jugador.puntosGrupos +
            jugador.puntosOctavos
        })
      );

    listaJugadores.sort((a, b) => {
      if (
        b.puntosTotales !==
        a.puntosTotales
      ) {
        return (
          b.puntosTotales -
          a.puntosTotales
        );
      }

      if (
        b.puntosOctavos !==
        a.puntosOctavos
      ) {
        return (
          b.puntosOctavos -
          a.puntosOctavos
        );
      }

      return (
        b.puntosGrupos -
        a.puntosGrupos
      );
    });

    contenedor.innerHTML = "";

    if (listaJugadores.length === 0) {
      contenedor.innerHTML = `
        <article class="partido">
          <h2>Sin participantes</h2>
          <p>
            Todavía no hay predicciones enviadas.
          </p>
        </article>
      `;

      return;
    }

    /* =========================
       MOSTRAR RANKING
    ========================= */

    listaJugadores.forEach(
      (jugador, posicion) => {
        let medalla = "";

        if (posicion === 0) {
          medalla = "🥇";
        } else if (posicion === 1) {
          medalla = "🥈";
        } else if (posicion === 2) {
          medalla = "🥉";
        }

        contenedor.insertAdjacentHTML(
          "beforeend",
          `
            <article class="partido ranking-card">

              <h2>
                ${medalla}
                #${posicion + 1}
                ${escaparHTML(jugador.nombre)}
              </h2>

              <p class="ranking-puntos">
                <strong>
                  ${jugador.puntosTotales}
                  puntos totales
                </strong>
              </p>

              <p>
                Fase de grupos:
                <strong>
                  ${jugador.puntosGrupos}
                </strong>
              </p>

              <p>
                Octavos:
                <strong>
                  ${jugador.puntosOctavos}
                </strong>
              </p>

            </article>
          `
        );
      }
    );

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

console.log("RANKING GENERAL LISTO");
