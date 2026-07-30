console.log("RANKING GENERAL V3");

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase.js";

/* =========================
   NORMALIZAR TEXTOS
========================= */

function normalizarTexto(texto) {
  return String(texto || "")
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
  return String(grupo || "")
    .trim()
    .toUpperCase()
    .replace("GRUPO", "")
    .trim();
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
   CONVERTIR FECHA
========================= */

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
      const [, dia, mes, anio, hora, minuto, segundo = "0"] = partes;

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

/* =========================
   CARGAR RANKING
========================= */

async function cargarRanking() {
  const contenedor = document.getElementById("ranking");

  contenedor.innerHTML = "<p>Cargando ranking...</p>";

  try {
    /* Resultados oficiales de grupos */

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

    console.log(
      "Clasificados oficiales:",
      clasificadosOficiales
    );

    /* Resultados oficiales de Octavos */

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

    /* Leer predicciones */

    const prediccionesSnap = await getDocs(
      collection(db, "predicciones")
    );

    const jugadores = {};

    prediccionesSnap.forEach((documento) => {
      const datos = documento.data();

      if (!datos.nombre) return;

      const claveUsuario =
        normalizarNombre(datos.nombre);

      if (!claveUsuario) return;

      if (!jugadores[claveUsuario]) {
        jugadores[claveUsuario] = {
          nombre: datos.nombre.trim(),

          prediccionesGrupos: {},

          prediccionesOctavos: {},

          puntosGrupos: 0,
          puntosOctavos: 0,

          ganadoresOctavos: 0,
          marcadoresExactos: 0
        };
      }

      const jugador = jugadores[claveUsuario];
      const fechaDocumento = obtenerFecha(datos);

      /* Guardar predicciones de grupos */

      if (
        datos.predicciones &&
        !Array.isArray(datos.predicciones)
      ) {
        Object.entries(datos.predicciones).forEach(
          ([nombreGrupo, equipos]) => {
            const grupo =
              normalizarGrupo(nombreGrupo);

            if (!["A", "B", "C", "D"].includes(grupo)) {
              return;
            }

            if (!Array.isArray(equipos)) {
              return;
            }

            const anterior =
              jugador.prediccionesGrupos[grupo];

            /*
              Conserva la predicción más reciente
              para ese grupo.
            */

            if (
              !anterior ||
              fechaDocumento >= anterior.fecha
            ) {
              jugador.prediccionesGrupos[grupo] = {
                equipos,
                fecha: fechaDocumento
              };
            }
          }
        );
      }

      /* Guardar predicciones de Octavos */

      if (
        datos.fase === "octavos" &&
        Array.isArray(datos.predicciones)
      ) {
        datos.predicciones.forEach((prediccion) => {
          const partido =
            Number(prediccion.partido);

          if (!partido) return;

          const anterior =
            jugador.prediccionesOctavos[partido];

          if (
            !anterior ||
            fechaDocumento >= anterior.fecha
          ) {
            jugador.prediccionesOctavos[partido] = {
              ...prediccion,
              fecha: fechaDocumento
            };
          }
        });
      }
    });

    /* Calcular puntos */

    Object.values(jugadores).forEach((jugador) => {
      /* Fase de grupos */

      ["A", "B", "C", "D"].forEach((grupo) => {
        const prediccion =
          jugador.prediccionesGrupos[grupo];

        const oficiales =
          clasificadosOficiales[grupo];

        if (!prediccion || !oficiales) {
          return;
        }

        prediccion.equipos.forEach((equipo) => {
          const equipoNormalizado =
            normalizarTexto(equipo);

          if (oficiales.has(equipoNormalizado)) {
            jugador.puntosGrupos++;
          }
        });
      });

      /* Octavos */

      Object.values(
        jugador.prediccionesOctavos
      ).forEach((prediccion) => {
        const resultadoReal =
          resultadosOctavos.find(
            (resultado) =>
              Number(resultado.partido) ===
              Number(prediccion.partido)
          );

        if (!resultadoReal) return;

        const ganadorCorrecto =
          normalizarTexto(prediccion.ganador) ===
          normalizarTexto(resultadoReal.ganador);

        const marcadorCorrecto =
          normalizarTexto(prediccion.resultado) ===
          normalizarTexto(resultadoReal.resultado);

        if (ganadorCorrecto) {
          jugador.puntosOctavos += 2;
          jugador.ganadoresOctavos++;

          if (marcadorCorrecto) {
            jugador.puntosOctavos++;
            jugador.marcadoresExactos++;
          }
        }
      });
    });

    /* Ordenar */

  const listaJugadores = Object.values(jugadores)
    .map((jugador) => ({
        ...jugador,

        bonoCompensacion: 0,

        puntosTotales:
            jugador.puntosGrupos +
            jugador.puntosOctavos
    }))
      .sort((a, b) => {
        if (b.puntosTotales !== a.puntosTotales) {
          return b.puntosTotales - a.puntosTotales;
        }

        return b.puntosOctavos - a.puntosOctavos;
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

    /* Mostrar ranking */

    listaJugadores.forEach((jugador, posicion) => {
      let medalla = "";

      if (posicion === 0) medalla = "🥇";
      else if (posicion === 1) medalla = "🥈";
      else if (posicion === 2) medalla = "🥉";

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
                ${jugador.puntosTotales} puntos totales
              </strong>
            </p>

            <p>
              Fase de grupos:
              <strong>${jugador.puntosGrupos}</strong>
            </p>

            <p>
              Octavos:
              <strong>${jugador.puntosOctavos}</strong>
            </p>
          
          </article>
        `
      );
    });

    console.log("Jugadores calculados:", listaJugadores);

  } catch (error) {
    console.error("Error al cargar ranking:", error);

    contenedor.innerHTML = `
      <article class="partido">
        <h2>❌ Error</h2>
        <p>No se pudo cargar el ranking.</p>
      </article>
    `;
  }
}

cargarRanking();
