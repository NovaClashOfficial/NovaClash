console.log("RANKING GENERAL NOVA CLASH V4");

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

/* ==========================================
   NORMALIZAR TEXTOS
========================================== */

function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizarNombre(nombre) {
  return normalizarTexto(nombre);
}

function normalizarGrupo(grupo) {
  return String(grupo ?? "")
    .trim()
    .toUpperCase()
    .replace("GRUPO", "")
    .trim();
}

function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ==========================================
   FECHA DE DOCUMENTOS
========================================== */

function obtenerFecha(datos) {
  if (datos.creado?.seconds) {
    return datos.creado.seconds * 1000;
  }

  if (datos.fecha?.seconds) {
    return datos.fecha.seconds * 1000;
  }

  if (typeof datos.fecha === "string") {
    const partes = datos.fecha.match(
      /(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/
    );

    if (partes) {
      const [
        ,
        dia,
        mes,
        anio,
        hora,
        minuto,
        segundo = "0"
      ] = partes;

      return new Date(
        Number(anio),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo)
      ).getTime();
    }
  }

  return 0;
}

/* ==========================================
   CREAR JUGADOR
========================================== */

function crearJugador(nombre) {
  return {
    nombre: String(nombre).trim(),

    prediccionesGrupos: {},
    prediccionesOctavos: {},
    prediccionesCuartos: {},

    puntosGrupos: 0,
    puntosOctavos: 0,
    puntosCuartos: 0,
    bonoCompensacion: 0,

    aciertosOctavos: 0,
    marcadoresOctavos: 0,

    aciertosCuartos: 0,
    marcadoresCuartos: 0,
    mvpCuartos: 0,
    hipercargasCuartos: 0
  };
}

/* ==========================================
   CARGAR RANKING
========================================== */

async function cargarRanking() {
  const contenedor =
    document.getElementById("ranking");

  if (!contenedor) return;

  contenedor.innerHTML =
    "<p>Cargando ranking...</p>";

  try {
    const clasificadosSnap = await getDocs(
      collection(db, "clasificados")
    );

    const clasificadosOficiales = {};

    clasificadosSnap.forEach((documento) => {
      const datos = documento.data();

      const grupo = normalizarGrupo(
        datos.grupo || documento.id
      );

      if (!Array.isArray(datos.clasificados)) {
        return;
      }

      clasificadosOficiales[grupo] = new Set(
        datos.clasificados.map(normalizarTexto)
      );
    });

    let resultadosOctavos = [];

    const octavosSnap = await getDoc(
      doc(db, "resultados", "octavos")
    );

    if (
      octavosSnap.exists() &&
      Array.isArray(octavosSnap.data().resultados)
    ) {
      resultadosOctavos =
        octavosSnap.data().resultados;
    }

    let resultadosCuartos = [];

    const cuartosSnap = await getDoc(
      doc(db, "resultados", "cuartos")
    );

    if (
      cuartosSnap.exists() &&
      Array.isArray(cuartosSnap.data().resultados)
    ) {
      resultadosCuartos =
        cuartosSnap.data().resultados;
    }

    const bonusSnap = await getDocs(
      collection(db, "bonusOctavos")
    );

    const bonusReclamados = new Map();

    bonusSnap.forEach((documento) => {
      const datos = documento.data();

      if (datos.reclamado === false) return;

      const nombreNormalizado =
        normalizarNombre(
          datos.nombreNormalizado ||
          datos.nombre
        );

      if (!nombreNormalizado) return;

      bonusReclamados.set(
        nombreNormalizado,
        Number(datos.puntos) || 3
      );
    });

    const prediccionesSnap = await getDocs(
      collection(db, "predicciones")
    );

    const jugadores = {};

    prediccionesSnap.forEach((documento) => {
      const datos = documento.data();

      if (!datos.nombre) return;

      const claveJugador =
        normalizarNombre(datos.nombre);

      if (!claveJugador) return;

      if (!jugadores[claveJugador]) {
        jugadores[claveJugador] =
          crearJugador(datos.nombre);
      }

      const jugador =
        jugadores[claveJugador];

      const fechaDocumento =
        obtenerFecha(datos);

      if (
        datos.predicciones &&
        !Array.isArray(datos.predicciones)
      ) {
        Object.entries(
          datos.predicciones
        ).forEach(([grupoOriginal, equipos]) => {
          const grupo =
            normalizarGrupo(grupoOriginal);

          if (
            !["A", "B", "C", "D"].includes(grupo)
          ) {
            return;
          }

          if (!Array.isArray(equipos)) {
            return;
          }

          const anterior =
            jugador.prediccionesGrupos[grupo];

          if (
            !anterior ||
            fechaDocumento >= anterior.fecha
          ) {
            jugador.prediccionesGrupos[grupo] = {
              equipos,
              fecha: fechaDocumento
            };
          }
        });
      }

      if (
        datos.fase === "octavos" &&
        Array.isArray(datos.predicciones)
      ) {
        datos.predicciones.forEach(
          (prediccion) => {
            const partido =
              Number(prediccion.partido);

            if (!partido) return;

            const anterior =
              jugador.prediccionesOctavos[
                partido
              ];

            if (
              !anterior ||
              fechaDocumento >= anterior.fecha
            ) {
              jugador.prediccionesOctavos[
                partido
              ] = {
                ...prediccion,
                fecha: fechaDocumento
              };
            }
          }
        );
      }

      if (
        datos.fase === "cuartos" &&
        Array.isArray(datos.predicciones)
      ) {
        datos.predicciones.forEach(
          (prediccion) => {
            const partido =
              Number(prediccion.partido);

            if (!partido) return;

            const anterior =
              jugador.prediccionesCuartos[
                partido
              ];

            if (
              !anterior ||
              fechaDocumento >= anterior.fecha
            ) {
              jugador.prediccionesCuartos[
                partido
              ] = {
                ...prediccion,
                fecha: fechaDocumento
              };
            }
          }
        );
      }
    });

    Object.entries(jugadores).forEach(
      ([claveJugador, jugador]) => {
        jugador.bonoCompensacion =
          bonusReclamados.get(claveJugador) ||
          0;

        ["A", "B", "C", "D"].forEach(
          (grupo) => {
            const prediccion =
              jugador.prediccionesGrupos[grupo];

            const oficiales =
              clasificadosOficiales[grupo];

            if (!prediccion || !oficiales) {
              return;
            }

            prediccion.equipos.forEach(
              (equipo) => {
                if (
                  oficiales.has(
                    normalizarTexto(equipo)
                  )
                ) {
                  jugador.puntosGrupos++;
                }
              }
            );
          }
        );

        Object.values(
          jugador.prediccionesOctavos
        ).forEach((prediccion) => {
          const oficial =
            resultadosOctavos.find(
              (resultado) =>
                Number(resultado.partido) ===
                Number(prediccion.partido)
            );

          if (!oficial) return;

          const ganadorCorrecto =
            normalizarTexto(prediccion.ganador) ===
            normalizarTexto(oficial.ganador);

          const marcadorCorrecto =
            normalizarTexto(prediccion.resultado) ===
            normalizarTexto(oficial.resultado);

          if (ganadorCorrecto) {
            jugador.puntosOctavos += 2;
            jugador.aciertosOctavos++;

            if (marcadorCorrecto) {
              jugador.puntosOctavos++;
              jugador.marcadoresOctavos++;
            }
          }
        });

        Object.values(
          jugador.prediccionesCuartos
        ).forEach((prediccion) => {
          const oficial =
            resultadosCuartos.find(
              (resultado) =>
                Number(resultado.partido) ===
                Number(prediccion.partido)
            );

          if (!oficial) return;

          const ganadorCorrecto =
            normalizarTexto(prediccion.ganador) ===
            normalizarTexto(oficial.ganador);

          const marcadorCorrecto =
            normalizarTexto(prediccion.resultado) ===
            normalizarTexto(oficial.resultado);

          if (ganadorCorrecto) {
            jugador.puntosCuartos += 2;
            jugador.aciertosCuartos++;
          }

          if (
            ganadorCorrecto &&
            marcadorCorrecto
          ) {
            jugador.puntosCuartos++;
            jugador.marcadoresCuartos++;
          }

          ["ronda1", "ronda2"].forEach(
            (rondaId) => {
              const rondaPredicha =
                prediccion.rondas?.[rondaId];

              const rondaOficial =
                oficial.rondas?.[rondaId];

              if (
                !rondaPredicha ||
                !rondaOficial
              ) {
                return;
              }

              if (
                normalizarTexto(
                  rondaPredicha.mvp
                ) ===
                normalizarTexto(
                  rondaOficial.mvp
                )
              ) {
                jugador.puntosCuartos++;
                jugador.mvpCuartos++;
              }

              if (
                normalizarTexto(
                  rondaPredicha.hipercargas
                ) ===
                normalizarTexto(
                  rondaOficial.hipercargas
                )
              ) {
                jugador.puntosCuartos++;
                jugador.hipercargasCuartos++;
              }
            }
          );
        });
      }
    );

    const listaJugadores =
      Object.values(jugadores)
        .map((jugador) => ({
          ...jugador,

          puntosTotales:
            jugador.puntosGrupos +
            jugador.puntosOctavos +
            jugador.bonoCompensacion +
            jugador.puntosCuartos
        }))
        .sort((a, b) => {
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
            b.puntosCuartos !==
            a.puntosCuartos
          ) {
            return (
              b.puntosCuartos -
              a.puntosCuartos
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
          <p>Todavía no hay predicciones registradas.</p>
        </article>
      `;

      return;
    }

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

              <div class="ranking-desglose">

                <p>
                  Fase de grupos:
                  <strong>${jugador.puntosGrupos}</strong>
                </p>

                <p>
                  Octavos:
                  <strong>${jugador.puntosOctavos}</strong>
                </p>

                ${
                  jugador.bonoCompensacion > 0
                    ? `
                      <p>
                        🎁 Bonus:
                        <strong>
                          +${jugador.bonoCompensacion}
                        </strong>
                      </p>
                    `
                    : ""
                }

                <p>
                  Cuartos:
                  <strong>${jugador.puntosCuartos}</strong>
                </p>

              </div>

            </article>
          `
        );
      }
    );

    console.log(
      "Ranking calculado:",
      listaJugadores
    );

  } catch (error) {
    console.error(
      "Error al cargar el ranking:",
      error
    );

    contenedor.innerHTML = `
      <article class="partido">
        <h2>❌ Error</h2>
        <p>No se pudo cargar el ranking.</p>
      </article>
    `;
  }
}

cargarRanking();

console.log("RANKING GENERAL V4 LISTO");
