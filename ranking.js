console.log("RANKING GENERAL NOVA CLASH V6");

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
    prediccionesSemifinales: {},
    prediccionesFinal: {},

    puntosGrupos: 0,
    puntosOctavos: 0,
    puntosCuartos: 0,
    puntosSemifinales: 0,
    puntosFinal: 0,
    bonoCompensacion: 0,

    aciertosOctavos: 0,
    marcadoresOctavos: 0,

    aciertosCuartos: 0,
    marcadoresCuartos: 0,
    mvpCuartos: 0,
    hipercargasCuartos: 0,

    aciertosSemifinales: 0,
    marcadoresSemifinales: 0,
    estelaresSemifinales: 0,

    aciertosFinal: 0,
    marcadoresFinal: 0,
    estelaresFinal: 0
  };
}

/* ==========================================
   CARGAR RESULTADO OFICIAL
========================================== */

async function cargarResultadosFase(fase) {
  try {
    const snap = await getDoc(
      doc(db, "resultados", fase)
    );

    if (
      snap.exists() &&
      Array.isArray(snap.data().resultados)
    ) {
      return snap.data().resultados;
    }

    return [];

  } catch (error) {
    console.error(
      `Error al cargar resultados de ${fase}:`,
      error
    );

    return [];
  }
}

/* ==========================================
   GUARDAR PREDICCIÓN MÁS RECIENTE
========================================== */

function guardarPrediccionReciente(
  contenedor,
  prediccion,
  fechaDocumento
) {
  const partido =
    Number(prediccion.partido);

  if (!partido) {
    return;
  }

  const anterior =
    contenedor[partido];

  if (
    !anterior ||
    fechaDocumento >= anterior.fecha
  ) {
    contenedor[partido] = {
      ...prediccion,
      fecha: fechaDocumento
    };
  }
}

/* ==========================================
   COMPARAR TEXTOS
========================================== */

function sonIguales(valor1, valor2) {
  return (
    normalizarTexto(valor1) ===
    normalizarTexto(valor2)
  );
}

/* ==========================================
   CALCULAR OCTAVOS
========================================== */

function calcularOctavos(
  jugador,
  resultadosOctavos
) {
  Object.values(
    jugador.prediccionesOctavos
  ).forEach((prediccion) => {
    const oficial =
      resultadosOctavos.find(
        (resultado) =>
          Number(resultado.partido) ===
          Number(prediccion.partido)
      );

    if (!oficial) {
      return;
    }

    const ganadorCorrecto =
      sonIguales(
        prediccion.ganador,
        oficial.ganador
      );

    const marcadorCorrecto =
      sonIguales(
        prediccion.resultado,
        oficial.resultado
      );

    if (ganadorCorrecto) {
      jugador.puntosOctavos += 2;
      jugador.aciertosOctavos++;

      if (marcadorCorrecto) {
        jugador.puntosOctavos++;
        jugador.marcadoresOctavos++;
      }
    }
  });
}

/* ==========================================
   CALCULAR CUARTOS
========================================== */

function calcularCuartos(
  jugador,
  resultadosCuartos
) {
  Object.values(
    jugador.prediccionesCuartos
  ).forEach((prediccion) => {
    const oficial =
      resultadosCuartos.find(
        (resultado) =>
          Number(resultado.partido) ===
          Number(prediccion.partido)
      );

    if (!oficial) {
      return;
    }

    const ganadorCorrecto =
      sonIguales(
        prediccion.ganador,
        oficial.ganador
      );

    const marcadorCorrecto =
      sonIguales(
        prediccion.resultado,
        oficial.resultado
      );

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
          sonIguales(
            rondaPredicha.mvp,
            rondaOficial.mvp
          )
        ) {
          jugador.puntosCuartos++;
          jugador.mvpCuartos++;
        }

        if (
          sonIguales(
            rondaPredicha.hipercargas,
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

/* ==========================================
   CALCULAR SEMIFINALES
========================================== */

function calcularSemifinales(
  jugador,
  resultadosSemifinales
) {
  Object.values(
    jugador.prediccionesSemifinales
  ).forEach((prediccion) => {
    const oficial =
      resultadosSemifinales.find(
        (resultado) =>
          Number(resultado.partido) ===
          Number(prediccion.partido)
      );

    if (!oficial) {
      return;
    }

    const ganadorCorrecto =
      sonIguales(
        prediccion.ganador,
        oficial.ganador
      );

    const marcadorCorrecto =
      sonIguales(
        prediccion.resultado,
        oficial.resultado
      );

    /*
      +3 por ganador.
    */

    if (ganadorCorrecto) {
      jugador.puntosSemifinales += 3;
      jugador.aciertosSemifinales++;
    }

    /*
      +2 por marcador exacto.
    */

    if (
      ganadorCorrecto &&
      marcadorCorrecto
    ) {
      jugador.puntosSemifinales += 2;
      jugador.marcadoresSemifinales++;
    }

    /*
      Solo se recorren las rondas que realmente
      existen en el resultado oficial.

      Si el resultado fue 3-0:
      ronda1, ronda2 y ronda3.

      Si fue 3-1:
      ronda1 hasta ronda4.

      Si fue 3-2:
      ronda1 hasta ronda5.
    */

    Object.entries(
      oficial.rondas || {}
    ).forEach(
      ([rondaId, rondaOficial]) => {
        const rondaPredicha =
          prediccion.rondas?.[rondaId];

        if (
          !rondaPredicha ||
          !rondaOficial
        ) {
          return;
        }

        const estelarPredicho =
          rondaPredicha.estelar ??
          rondaPredicha.mvp;

        const estelarOficial =
          rondaOficial.estelar ??
          rondaOficial.mvp;

        if (
          sonIguales(
            estelarPredicho,
            estelarOficial
          )
        ) {
          jugador.puntosSemifinales++;
          jugador.estelaresSemifinales++;
        }
      }
    );
  });
}
/* ==========================================
   CALCULAR FINAL
========================================== */

function calcularFinal(
  jugador,
  resultadosFinal
) {
  Object.values(
    jugador.prediccionesFinal
  ).forEach((prediccion) => {
    const oficial =
      resultadosFinal.find(
        (resultado) =>
          Number(resultado.partido) ===
          Number(prediccion.partido)
      );

    if (!oficial) {
      return;
    }

    const ganadorCorrecto =
      sonIguales(
        prediccion.ganador,
        oficial.ganador
      );

    const marcadorCorrecto =
      sonIguales(
        prediccion.resultado,
        oficial.resultado
      );

    if (ganadorCorrecto) {
      jugador.puntosFinal += 10;
      jugador.aciertosFinal++;
    }

    if (
      ganadorCorrecto &&
      marcadorCorrecto
    ) {
      jugador.puntosFinal += 5;
      jugador.marcadoresFinal++;
    }

    Object.entries(
      oficial.rondas || {}
    ).forEach(
      ([rondaId, rondaOficial]) => {
        const rondaPredicha =
          prediccion.rondas?.[rondaId];

        if (
          !rondaPredicha ||
          !rondaOficial
        ) {
          return;
        }

        const estelarPredicho =
          rondaPredicha.estelar ??
          rondaPredicha.mvp;

        const estelarOficial =
          rondaOficial.estelar ??
          rondaOficial.mvp;

        if (
          sonIguales(
            estelarPredicho,
            estelarOficial
          )
        ) {
          jugador.puntosFinal += 2;
          jugador.estelaresFinal++;
        }
      }
    );
  });
}

/* ==========================================
   CARGAR RANKING
========================================== */

async function cargarRanking() {
  const contenedor =
    document.getElementById("ranking");

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML =
    "<p>Cargando ranking...</p>";

  try {
    /* ======================================
       RESULTADOS OFICIALES DE GRUPOS
    ====================================== */

    const clasificadosSnap =
      await getDocs(
        collection(db, "clasificados")
      );

    const clasificadosOficiales = {};

    clasificadosSnap.forEach(
      (documento) => {
        const datos =
          documento.data();

        const grupo =
          normalizarGrupo(
            datos.grupo ||
            documento.id
          );

        if (
          !Array.isArray(
            datos.clasificados
          )
        ) {
          return;
        }

        clasificadosOficiales[grupo] =
          new Set(
            datos.clasificados.map(
              normalizarTexto
            )
          );
      }
    );

    /* ======================================
       RESULTADOS OFICIALES
    ====================================== */

    const [
      resultadosOctavos,
      resultadosCuartos,
      resultadosSemifinales,
      resultadosFinal
    ] = await Promise.all([
      cargarResultadosFase("octavos"),
      cargarResultadosFase("cuartos"),
      cargarResultadosFase(
        "semifinales"
      ),
      cargarResultadosFase("final")
    ]);

    console.log(
      "Resultados semifinales:",
      resultadosSemifinales
    );

    /* ======================================
       BONOS DE OCTAVOS
    ====================================== */

    const bonusSnap =
      await getDocs(
        collection(
          db,
          "bonusOctavos"
        )
      );

    const bonusReclamados =
      new Map();

    bonusSnap.forEach(
      (documento) => {
        const datos =
          documento.data();

        if (
          datos.reclamado === false
        ) {
          return;
        }

        const nombreNormalizado =
          normalizarNombre(
            datos.nombreNormalizado ||
            datos.nombre
          );

        if (!nombreNormalizado) {
          return;
        }

        bonusReclamados.set(
          nombreNormalizado,
          Number(datos.puntos) || 3
        );
      }
    );

    /* ======================================
       LEER TODAS LAS PREDICCIONES
    ====================================== */

    const prediccionesSnap =
      await getDocs(
        collection(
          db,
          "predicciones"
        )
      );

    const jugadores = {};

    prediccionesSnap.forEach(
      (documento) => {
        const datos =
          documento.data();

        if (!datos.nombre) {
          return;
        }

        const claveJugador =
          normalizarNombre(
            datos.nombre
          );

        if (!claveJugador) {
          return;
        }

        if (
          !jugadores[claveJugador]
        ) {
          jugadores[claveJugador] =
            crearJugador(
              datos.nombre
            );
        }

        const jugador =
          jugadores[claveJugador];

        const fechaDocumento =
          obtenerFecha(datos);

        /* ==================================
           PREDICCIONES DE GRUPOS
        ================================== */

        if (
          datos.predicciones &&
          !Array.isArray(
            datos.predicciones
          )
        ) {
          Object.entries(
            datos.predicciones
          ).forEach(
            ([
              grupoOriginal,
              equipos
            ]) => {
              const grupo =
                normalizarGrupo(
                  grupoOriginal
                );

              if (
                ![
                  "A",
                  "B",
                  "C",
                  "D"
                ].includes(grupo)
              ) {
                return;
              }

              if (
                !Array.isArray(
                  equipos
                )
              ) {
                return;
              }

              const anterior =
                jugador
                  .prediccionesGrupos[
                    grupo
                  ];

              if (
                !anterior ||
                fechaDocumento >=
                  anterior.fecha
              ) {
                jugador
                  .prediccionesGrupos[
                    grupo
                  ] = {
                    equipos,
                    fecha:
                      fechaDocumento
                  };
              }
            }
          );
        }

        /* ==================================
           OCTAVOS
        ================================== */

        if (
          datos.fase ===
            "octavos" &&
          Array.isArray(
            datos.predicciones
          )
        ) {
          datos.predicciones.forEach(
            (prediccion) => {
              guardarPrediccionReciente(
                jugador
                  .prediccionesOctavos,
                prediccion,
                fechaDocumento
              );
            }
          );
        }

        /* ==================================
           CUARTOS
        ================================== */

        if (
          datos.fase ===
            "cuartos" &&
          Array.isArray(
            datos.predicciones
          )
        ) {
          datos.predicciones.forEach(
            (prediccion) => {
              guardarPrediccionReciente(
                jugador
                  .prediccionesCuartos,
                prediccion,
                fechaDocumento
              );
            }
          );
        }

        /* ==================================
           SEMIFINALES
        ================================== */

        if (
          datos.fase ===
            "semifinales" &&
          Array.isArray(
            datos.predicciones
          )
        ) {
          datos.predicciones.forEach(
            (prediccion) => {
              guardarPrediccionReciente(
                jugador
                  .prediccionesSemifinales,
                prediccion,
                fechaDocumento
              );
            }
          );
        }

        /* ==================================
           FINAL
        ================================== */

        if (
          datos.fase ===
            "final" &&
          Array.isArray(
            datos.predicciones
          )
        ) {
          datos.predicciones.forEach(
            (prediccion) => {
              guardarPrediccionReciente(
                jugador
                  .prediccionesFinal,
                prediccion,
                fechaDocumento
              );
            }
          );
        }
      }
    );

    /* ======================================
       CALCULAR PUNTOS
    ====================================== */

    Object.entries(
      jugadores
    ).forEach(
      ([
        claveJugador,
        jugador
      ]) => {
        jugador.bonoCompensacion =
          bonusReclamados.get(
            claveJugador
          ) || 0;

        /* ================================
           GRUPOS
        ================================ */

        [
          "A",
          "B",
          "C",
          "D"
        ].forEach((grupo) => {
          const prediccion =
            jugador
              .prediccionesGrupos[
                grupo
              ];

          const oficiales =
            clasificadosOficiales[
              grupo
            ];

          if (
            !prediccion ||
            !oficiales
          ) {
            return;
          }

          prediccion.equipos.forEach(
            (equipo) => {
              if (
                oficiales.has(
                  normalizarTexto(
                    equipo
                  )
                )
              ) {
                jugador
                  .puntosGrupos++;
              }
            }
          );
        });

        calcularOctavos(
          jugador,
          resultadosOctavos
        );

        calcularCuartos(
          jugador,
          resultadosCuartos
        );

        calcularSemifinales(
          jugador,
          resultadosSemifinales
        );

        calcularFinal(
          jugador,
          resultadosFinal
        );
      }
    );

    /* ======================================
       CREAR LISTA ORDENADA
    ====================================== */

    const listaJugadores =
      Object.values(jugadores)
        .map((jugador) => ({
          ...jugador,

          puntosTotales:
            jugador.puntosGrupos +
            jugador.puntosOctavos +
            jugador
              .bonoCompensacion +
            jugador.puntosCuartos +
            jugador
              .puntosSemifinales +
            jugador.puntosFinal
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
            b.puntosFinal !==
            a.puntosFinal
          ) {
            return (
              b.puntosFinal -
              a.puntosFinal
            );
          }

          if (
            b.puntosSemifinales !==
            a.puntosSemifinales
          ) {
            return (
              b.puntosSemifinales -
              a.puntosSemifinales
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

    if (
      listaJugadores.length === 0
    ) {
      contenedor.innerHTML = `
        <article class="partido">

          <h2>
            Sin participantes
          </h2>

          <p>
            Todavía no hay predicciones
            registradas.
          </p>

        </article>
      `;

      return;
    }

    /* ======================================
       MOSTRAR RANKING
    ====================================== */

    listaJugadores.forEach(
      (jugador, posicion) => {
        let medalla = "";

        if (posicion === 0) {
          medalla = "🥇";
        } else if (
          posicion === 1
        ) {
          medalla = "🥈";
        } else if (
          posicion === 2
        ) {
          medalla = "🥉";
        }

        contenedor.insertAdjacentHTML(
          "beforeend",
          `
            <article
              class="partido ranking-card"
            >

              <h2>
                ${medalla}
                #${posicion + 1}
                ${escaparHTML(
                  jugador.nombre
                )}
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

                ${
                  jugador
                    .bonoCompensacion >
                  0
                    ? `
                      <p>
                        🎁 Bonus:
                        <strong>
                          +${
                            jugador
                              .bonoCompensacion
                          }
                        </strong>
                      </p>
                    `
                    : ""
                }

                <p>
                  Cuartos:
                  <strong>
                    ${jugador.puntosCuartos}
                  </strong>
                </p>

                <p>
                  Semifinales:
                  <strong>
                    ${
                      jugador
                        .puntosSemifinales
                    }
                  </strong>
                </p>

                <p>
                  Final:
                  <strong>
                    ${jugador.puntosFinal}
                  </strong>
                </p>

              </div>

            </article>
          `
        );
      }
    );

    console.log(
      "Ranking V5 calculado:",
      listaJugadores
    );

  } catch (error) {
    console.error(
      "Error al cargar ranking:",
      error
    );

    contenedor.innerHTML = `
      <article class="partido">

        <h2>
          ❌ Error
        </h2>

        <p>
          No se pudo cargar el ranking.
        </p>

      </article>
    `;
  }
}

/* ==========================================
   INICIAR
========================================== */

cargarRanking();

console.log(
  "RANKING GENERAL V6 LISTO"
);
