console.log("SALA FINAL LAB V2 - MODOS");

import {
  jugadoresFinalistas,
  modosFinal,
  mapasPorModo,
  configuracionModos,
  reglasFinal,
  brawlersConBuffies,
  opcionesBuffies,
  brawlersGenerales,
  opcionesBrawlersGenerales,
  preguntasEncuesta,
  pasosSalaFinal
} from "./config-sala-final.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
  db
} from "./firebase.js";

const TOTAL_PASOS =
  pasosSalaFinal.length;

let pasoActual = 1;
let jugadorActual = null;

let mostrandoResumen = false;
let envioRealizado = false;
/*
  Acá se guardarán temporalmente todas
  las decisiones antes de enviarlas.
*/

const respuestas = {
  modosDescartados: [],
  mapas: {},
  desempate: {
    modo: "",
    mapa: ""
  },
  reglas: {},
  buffies: {
    opcion: "",
    bloqueados: []
  },
  brawlersGenerales: {
  opcion: "",
  brawlersEscritos: "",
  recomendacion: ""
},
  encuesta: {}
};

/* =========================
   ELEMENTOS GENERALES
========================= */

const pantallaAcceso =
  document.getElementById(
    "pantalla-acceso"
  );

const pantallaSala =
  document.getElementById(
    "pantalla-sala"
  );

const inputCodigo =
  document.getElementById(
    "codigo-acceso"
  );

const botonIngresar =
  document.getElementById(
    "btn-ingresar"
  );

const mensajeAcceso =
  document.getElementById(
    "mensaje-acceso"
  );

const nombreJugador =
  document.getElementById(
    "nombre-jugador"
  );

const equipoJugador =
  document.getElementById(
    "equipo-jugador"
  );

const textoPaso =
  document.getElementById(
    "texto-paso"
  );

const porcentajePaso =
  document.getElementById(
    "porcentaje-paso"
  );

const barraProgreso =
  document.getElementById(
    "barra-progreso-activa"
  );

const botonAnterior =
  document.getElementById(
    "btn-anterior"
  );

const botonSiguiente =
  document.getElementById(
    "btn-siguiente"
  );

/* =========================
   ELEMENTOS DE MODOS
========================= */

const contenedorModos =
  document.getElementById(
    "opciones-modos"
  );

const contadorModos =
  document.getElementById(
    "contador-modos"
  );

const mensajeModos =
  document.getElementById(
    "mensaje-modos"
  );

const contenedorMapas =
  document.getElementById(
    "contenedor-mapas"
  );

const mensajeMapas =
  document.getElementById(
    "mensaje-mapas"
  );

const contenedorDesempate =
  document.getElementById(
    "contenedor-desempate"
  );

const mensajeDesempate =
  document.getElementById(
    "mensaje-desempate"
  );

const contenedorReglas =
  document.getElementById(
    "contenedor-reglas"
  );

const mensajeReglas =
  document.getElementById(
    "mensaje-reglas"
  );

const contenedorBuffies =
  document.getElementById(
    "contenedor-buffies"
  );

const mensajeBuffies =
  document.getElementById(
    "mensaje-buffies"
  );

const contenedorBrawlersGenerales =
  document.getElementById(
    "contenedor-brawlers-generales"
  );

const mensajeBrawlersGenerales =
  document.getElementById(
    "mensaje-brawlers-generales"
  );
const contenedorEncuesta =
  document.getElementById(
    "contenedor-encuesta"
  );

const mensajeEncuesta =
  document.getElementById(
    "mensaje-encuesta"
  );
const pantallaResumen =
  document.getElementById(
    "pantalla-resumen"
  );

const contenidoResumen =
  document.getElementById(
    "contenido-resumen"
  );

const mensajeEnvio =
  document.getElementById(
    "mensaje-envio"
  );
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
   NORMALIZAR CÓDIGO
========================= */

function normalizarCodigo(codigo) {
  return String(codigo || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/* =========================
   INGRESAR
========================= */

function ingresarSala() {
  const codigo =
    normalizarCodigo(
      inputCodigo.value
    );

  if (!codigo) {
    mensajeAcceso.textContent =
      "Escribe tu código personal.";

    mensajeAcceso.className =
      "mensaje-error";

    inputCodigo.focus();

    return;
  }

  const jugador =
    jugadoresFinalistas[codigo];

  if (!jugador) {
    mensajeAcceso.textContent =
      "Código inválido o no registrado.";

    mensajeAcceso.className =
      "mensaje-error";

    return;
  }

  jugadorActual = {
    codigo,
    ...jugador
  };

  nombreJugador.textContent =
    jugadorActual.nombre;

  equipoJugador.textContent =
    jugadorActual.equipo;

  mensajeAcceso.textContent = "";

  pantallaAcceso.classList.remove(
    "activa"
  );

  pantallaSala.classList.add(
    "activa"
  );

  pasoActual = 1;

  renderizarModos();
  actualizarPaso();
}

/* =========================
   CREAR OPCIONES DE MODOS
========================= */

function renderizarModos() {
  if (!contenedorModos) {
    return;
  }

  contenedorModos.innerHTML =
    modosFinal.map((modo) => {
      const seleccionado =
        respuestas.modosDescartados
          .includes(modo.id);

      return `
        <label
          class="modo-card ${
            seleccionado
              ? "seleccionado"
              : ""
          }"
        >

          <input
            type="checkbox"
            name="modos-descartados"
            value="${escaparHTML(modo.id)}"
            ${seleccionado ? "checked" : ""}
          >

          <span class="modo-icono">
            ${escaparHTML(modo.icono)}
          </span>

          <span class="modo-nombre">
            ${escaparHTML(modo.nombre)}
          </span>

          <span class="modo-estado">
            ${
              seleccionado
                ? "DESCARTADO"
                : "DISPONIBLE"
            }
          </span>

        </label>
      `;
    }).join("");

  const opciones =
    contenedorModos.querySelectorAll(
      'input[name="modos-descartados"]'
    );

  opciones.forEach((opcion) => {
    opcion.addEventListener(
      "change",
      controlarSeleccionModo
    );
  });

  actualizarEstadoModos();
}

/* =========================
   SELECCIONAR MODO
========================= */

function controlarSeleccionModo(
  evento
) {
  const checkbox = evento.target;

  const limite =
    configuracionModos
      .cantidadADescartar;

  const seleccionados =
    respuestas.modosDescartados;

  if (checkbox.checked) {
    if (
      seleccionados.length >= limite
    ) {
      checkbox.checked = false;

      mensajeModos.textContent =
        `Solo podés descartar ${limite} modos.`;

      mensajeModos.className =
        "mensaje-paso mensaje-error";

      return;
    }

    seleccionados.push(
      checkbox.value
    );
  } else {
    respuestas.modosDescartados =
      seleccionados.filter(
        (modoId) =>
          modoId !== checkbox.value
      );
  }

  mensajeModos.textContent = "";

  renderizarModos();
}

/* =========================
   ACTUALIZAR CONTADOR
========================= */

function actualizarEstadoModos() {
  const cantidad =
    respuestas.modosDescartados.length;

  const limite =
    configuracionModos
      .cantidadADescartar;

  contadorModos.textContent =
    `${cantidad} / ${limite}`;

  contadorModos.classList.toggle(
    "completo",
    cantidad === limite
  );

  /*
    Bloquea visualmente las opciones restantes
    cuando ya se eligieron exactamente tres.
  */

  const tarjetas =
    contenedorModos.querySelectorAll(
      ".modo-card"
    );

  tarjetas.forEach((tarjeta) => {
    const checkbox =
      tarjeta.querySelector("input");

    const debeBloquear =
      cantidad >= limite &&
      !checkbox.checked;

    checkbox.disabled =
      debeBloquear;

    tarjeta.classList.toggle(
      "bloqueado",
      debeBloquear
    );
  });
}

/* =========================
   MODOS DISPONIBLES
========================= */

function obtenerModosDisponibles() {
  return modosFinal.filter(
    (modo) =>
      !respuestas.modosDescartados.includes(
        modo.id
      )
  );
}

/* =========================
   RENDERIZAR MAPAS
========================= */

function renderizarMapas() {
  if (!contenedorMapas) {
    return;
  }

  const modosDisponibles =
    obtenerModosDisponibles();

  /*
    Limpia elecciones de mapas que
    correspondan a modos descartados.
  */

  Object.keys(respuestas.mapas).forEach(
    (modoId) => {
      const sigueDisponible =
        modosDisponibles.some(
          (modo) => modo.id === modoId
        );

      if (!sigueDisponible) {
        delete respuestas.mapas[modoId];
      }
    }
  );

  contenedorMapas.innerHTML =
    modosDisponibles.map((modo) => {
      const mapas =
        mapasPorModo[modo.id] || [];

      const mapaElegido =
        respuestas.mapas[modo.id] || "";

      return `
        <section class="grupo-mapas">

          <button
            type="button"
            class="mapa-desplegable"
            data-modo="${escaparHTML(modo.id)}"
          >

            <span>
              ${escaparHTML(modo.icono)}
              ${escaparHTML(modo.nombre)}
            </span>

            <span class="flecha-mapa">
              ▼
            </span>

          </button>

          <div
            class="lista-mapas"
            data-lista-modo="${escaparHTML(modo.id)}"
          >

            ${mapas.map((mapa) => `
              <label class="mapa-card">

                <input
                  type="radio"
                  name="mapa-${escaparHTML(modo.id)}"
                  value="${escaparHTML(mapa)}"
                  ${
                    mapaElegido === mapa
                      ? "checked"
                      : ""
                  }
                >

                <span>
                  ${escaparHTML(mapa)}
                </span>

              </label>
            `).join("")}

          </div>

        </section>
      `;
    }).join("");

  activarEventosMapas();
}

/* =========================
   EVENTOS DE MAPAS
========================= */

function activarEventosMapas() {
  const botones =
    contenedorMapas.querySelectorAll(
      ".mapa-desplegable"
    );

  botones.forEach((boton) => {
    boton.addEventListener(
      "click",
      () => {
        const modoId =
          boton.dataset.modo;

        const lista =
          contenedorMapas.querySelector(
            `[data-lista-modo="${modoId}"]`
          );

        lista?.classList.toggle(
          "activa"
        );

        boton.classList.toggle(
          "abierto"
        );
      }
    );
  });

  const radios =
    contenedorMapas.querySelectorAll(
      '.mapa-card input[type="radio"]'
    );

  radios.forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        const modoId =
          radio.name.replace(
            "mapa-",
            ""
          );

        respuestas.mapas[modoId] =
          radio.value;

        mensajeMapas.textContent = "";

        actualizarTarjetasMapas();
      }
    );
  });

  actualizarTarjetasMapas();
}

/* =========================
   ACTUALIZAR TARJETAS
========================= */

function actualizarTarjetasMapas() {
  const tarjetas =
    contenedorMapas.querySelectorAll(
      ".mapa-card"
    );

  tarjetas.forEach((tarjeta) => {
    const radio =
      tarjeta.querySelector("input");

    tarjeta.classList.toggle(
      "seleccionado",
      radio.checked
    );
  });
}

/* =========================
   MODOS DE DESEMPATE DISPONIBLES
========================= */

function obtenerModosDesempateDisponibles() {
  return modosFinal.filter(
    (modo) =>
      modo.habilitadoParaDesempate &&
      !respuestas.modosDescartados.includes(
        modo.id
      )
  );
}

/* =========================
   RENDERIZAR DESEMPATE
========================= */

function renderizarDesempate() {
  if (!contenedorDesempate) {
    return;
  }

  const modosDisponibles =
    obtenerModosDesempateDisponibles();

  /*
    Si el modo elegido ya no está disponible,
    se limpia junto con su mapa.
  */

  const modoActualSigueDisponible =
    modosDisponibles.some(
      (modo) =>
        modo.id ===
        respuestas.desempate.modo
    );

  if (!modoActualSigueDisponible) {
    respuestas.desempate.modo = "";
    respuestas.desempate.mapa = "";
  }

  /*
    Si no queda ningún modo posible,
    no hace falta elegir desempate.
  */

  if (modosDisponibles.length === 0) {
    contenedorDesempate.innerHTML = `
      <div class="sin-desempate">

        <span class="sin-desempate-icono">
          ⚠️
        </span>

        <h3>
          No hay modos de desempate disponibles
        </h3>

        <p>
          Atrapagemas, Noqueo y Caza Estelar
          fueron descartados.
        </p>

        <p>
          Este paso será omitido automáticamente.
        </p>

      </div>
    `;

    mensajeDesempate.textContent =
      "✅ No es necesario elegir desempate.";

    mensajeDesempate.className =
      "mensaje-paso mensaje-exito";

    return;
  }

  const modoElegido =
    modosDisponibles.find(
      (modo) =>
        modo.id ===
        respuestas.desempate.modo
    );

  contenedorDesempate.innerHTML = `
    <section class="bloque-desempate">

      <h3 class="subtitulo-desempate">
        Elegí el modo de desempate
      </h3>

      <div class="opciones-desempate-modo">

        ${modosDisponibles.map((modo) => `
          <label
            class="desempate-modo-card ${
              respuestas.desempate.modo === modo.id
                ? "seleccionado"
                : ""
            }"
          >

            <input
              type="radio"
              name="modo-desempate"
              value="${escaparHTML(modo.id)}"
              ${
                respuestas.desempate.modo === modo.id
                  ? "checked"
                  : ""
              }
            >

            <span class="desempate-icono">
              ${escaparHTML(modo.icono)}
            </span>

            <span class="desempate-nombre">
              ${escaparHTML(modo.nombre)}
            </span>

          </label>
        `).join("")}

      </div>

    </section>

    ${
      modoElegido
        ? `
          <section class="bloque-desempate">

            <h3 class="subtitulo-desempate">
              Elegí el mapa de desempate
            </h3>

            <div class="opciones-desempate-mapa">

              ${
                (
                  mapasPorModo[
                    modoElegido.id
                  ] || []
                ).map((mapa) => `
                  <label
                    class="desempate-mapa-card ${
                      respuestas.desempate.mapa === mapa
                        ? "seleccionado"
                        : ""
                    }"
                  >

                    <input
                      type="radio"
                      name="mapa-desempate"
                      value="${escaparHTML(mapa)}"
                      ${
                        respuestas.desempate.mapa === mapa
                          ? "checked"
                          : ""
                      }
                    >

                    <span>
                      ${escaparHTML(mapa)}
                    </span>

                  </label>
                `).join("")
              }

            </div>

          </section>
        `
        : `
          <div class="aviso-elegir-modo">
            Elegí primero un modo para ver sus mapas.
          </div>
        `
    }
  `;

  activarEventosDesempate();
}

/* =========================
   EVENTOS DE DESEMPATE
========================= */

function activarEventosDesempate() {
  const radiosModo =
    contenedorDesempate.querySelectorAll(
      'input[name="modo-desempate"]'
    );

  radiosModo.forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        respuestas.desempate.modo =
          radio.value;

        /*
          Al cambiar de modo, se limpia
          el mapa anterior.
        */

        respuestas.desempate.mapa = "";

        mensajeDesempate.textContent = "";

        renderizarDesempate();
      }
    );
  });

  const radiosMapa =
    contenedorDesempate.querySelectorAll(
      'input[name="mapa-desempate"]'
    );

  radiosMapa.forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        respuestas.desempate.mapa =
          radio.value;

        mensajeDesempate.textContent = "";

        renderizarDesempate();
      }
    );
  });
}

/* =========================
   RENDERIZAR REGLAS
========================= */
function renderizarReglas() {
  if (!contenedorReglas) {
    return;
  }

  contenedorReglas.innerHTML =
    reglasFinal.map((regla) => {
      const valorElegido =
        respuestas.reglas[regla.id] || "";

      return `
        <section class="regla-bloque">

          <div class="regla-encabezado">

            <h3>
              ${escaparHTML(regla.nombre)}
            </h3>

            <span class="regla-tipo">
              Individual
            </span>

          </div>

          <p class="regla-descripcion">
            ${escaparHTML(regla.descripcion)}
          </p>

          <div class="regla-opciones">

            ${regla.opciones.map((opcion) => `
              <label
                class="regla-card ${
                  valorElegido === opcion.valor
                    ? "seleccionado"
                    : ""
                }"
              >

                <input
                  type="radio"
                  name="regla-${escaparHTML(regla.id)}"
                  value="${escaparHTML(opcion.valor)}"
                  ${
                    valorElegido === opcion.valor
                      ? "checked"
                      : ""
                  }
                >

                <span>
                  ${escaparHTML(opcion.texto)}
                </span>

              </label>
            `).join("")}

          </div>

        </section>
      `;
    }).join("");

  activarEventosReglas();
}

/* =========================
   EVENTOS DE REGLAS
========================= */

function activarEventosReglas() {
  const radios =
    contenedorReglas.querySelectorAll(
      '.regla-card input[type="radio"]'
    );

  radios.forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        const reglaId =
          radio.name.replace(
            "regla-",
            ""
          );

        respuestas.reglas[reglaId] =
          radio.value;

        mensajeReglas.textContent = "";

        renderizarReglas();
      }
    );
  });
}

/* =========================
   OBTENER OPCIÓN DE BUFFIES
========================= */

function obtenerOpcionBuffies() {
  return opcionesBuffies.find(
    (opcion) =>
      opcion.valor ===
      respuestas.buffies.opcion
  );
}

/* =========================
   RENDERIZAR BUFFIES
========================= */

function renderizarBuffies() {
  if (!contenedorBuffies) {
    return;
  }

  const opcionElegida =
    obtenerOpcionBuffies();

  let cantidadNecesaria = 0;

  if (
    opcionElegida &&
    typeof opcionElegida.cantidadBloqueos ===
      "number"
  ) {
    cantidadNecesaria =
      opcionElegida.cantidadBloqueos;
  }

  contenedorBuffies.innerHTML = `
    <section class="buffies-bloque">

      <h3 class="buffies-subtitulo">
        ¿Cómo se usarán los brawlers con buffies?
      </h3>

      <div class="opciones-buffies">

        ${opcionesBuffies.map((opcion) => `
          <label
            class="buffie-opcion-card ${
              respuestas.buffies.opcion ===
              opcion.valor
                ? "seleccionado"
                : ""
            }"
          >

            <input
              type="radio"
              name="opcion-buffies"
              value="${escaparHTML(opcion.valor)}"
              ${
                respuestas.buffies.opcion ===
                opcion.valor
                  ? "checked"
                  : ""
              }
            >

            <span>
              ${escaparHTML(opcion.texto)}
            </span>

          </label>
        `).join("")}

      </div>

    </section>

    ${
      cantidadNecesaria > 0
        ? `
          <section class="buffies-bloque">

            <div class="contador-seleccion">

              <span>
                Brawlers bloqueados
              </span>

              <strong
                id="contador-buffies"
                class="${
                  respuestas.buffies.bloqueados
                    .length === cantidadNecesaria
                    ? "completo"
                    : ""
                }"
              >
                ${
                  respuestas.buffies.bloqueados
                    .length
                } / ${cantidadNecesaria}
              </strong>

            </div>

            <p class="buffies-ayuda">
              Elegí exactamente
              ${cantidadNecesaria}
              brawlers para bloquear.
            </p>

            <div class="lista-brawlers-buffies">

              ${brawlersConBuffies.map(
                (brawler) => {
                  const seleccionado =
                    respuestas.buffies
                      .bloqueados
                      .includes(brawler);

                  const limiteAlcanzado =
                    respuestas.buffies
                      .bloqueados.length >=
                      cantidadNecesaria;

                  const bloqueado =
                    limiteAlcanzado &&
                    !seleccionado;

                  return `
                    <label
                      class="
                        brawler-chip
                        ${
                          seleccionado
                            ? "seleccionado"
                            : ""
                        }
                        ${
                          bloqueado
                            ? "bloqueado"
                            : ""
                        }
                      "
                    >

                      <input
                        type="checkbox"
                        name="brawler-buffie"
                        value="${escaparHTML(brawler)}"
                        ${
                          seleccionado
                            ? "checked"
                            : ""
                        }
                        ${
                          bloqueado
                            ? "disabled"
                            : ""
                        }
                      >

                      <span>
                        ${escaparHTML(brawler)}
                      </span>

                    </label>
                  `;
                }
              ).join("")}

            </div>

          </section>
        `
        : ""
    }

    ${
      opcionElegida?.cantidadBloqueos ===
      "todos"
        ? `
          <div class="todos-buffies-bloqueados">
            🚫 Todos los brawlers con buffies
            quedarán bloqueados.
          </div>
        `
        : ""
    }
  `;

  activarEventosBuffies();
}

/* =========================
   EVENTOS DE BUFFIES
========================= */

function activarEventosBuffies() {
  const opciones =
    contenedorBuffies.querySelectorAll(
      'input[name="opcion-buffies"]'
    );

  opciones.forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        respuestas.buffies.opcion =
          radio.value;

        const opcion =
          obtenerOpcionBuffies();

        if (
          opcion?.cantidadBloqueos ===
          "todos"
        ) {
          respuestas.buffies.bloqueados =
            [...brawlersConBuffies];

        } else {
          respuestas.buffies.bloqueados =
            [];
        }

        mensajeBuffies.textContent = "";

        renderizarBuffies();
      }
    );
  });

  const checkboxes =
    contenedorBuffies.querySelectorAll(
      'input[name="brawler-buffie"]'
    );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener(
      "change",
      () => {
        const opcion =
          obtenerOpcionBuffies();

        const limite =
          Number(
            opcion?.cantidadBloqueos
          ) || 0;

        if (checkbox.checked) {
          if (
            respuestas.buffies.bloqueados
              .length >= limite
          ) {
            checkbox.checked = false;

            mensajeBuffies.textContent =
              `Solo podés bloquear ${limite} brawlers.`;

            mensajeBuffies.className =
              "mensaje-paso mensaje-error";

            return;
          }

          respuestas.buffies.bloqueados
            .push(checkbox.value);

        } else {
          respuestas.buffies.bloqueados =
            respuestas.buffies.bloqueados
              .filter(
                (brawler) =>
                  brawler !== checkbox.value
              );
        }

        mensajeBuffies.textContent = "";

        renderizarBuffies();
      }
    );
  });
}
/* =========================
   RENDERIZAR BRAWLERS GENERALES
========================= */

function renderizarBrawlersGenerales() {
  if (!contenedorBrawlersGenerales) {
    return;
  }

  const opcion =
    respuestas.brawlersGenerales.opcion;

  contenedorBrawlersGenerales.innerHTML = `
    <section class="brawlers-generales-bloque">

      <h3 class="brawlers-generales-titulo">
        ¿Querés recomendar prohibiciones generales?
      </h3>

      <p class="brawlers-generales-descripcion">
        Esta decisión es individual. Podés recomendar no prohibir ninguno
        o proponer hasta 3 brawlers.
      </p>

      <div class="opciones-brawlers-generales">

        <label
          class="brawler-general-opcion ${
            opcion === "ninguno"
              ? "seleccionado"
              : ""
          }"
        >

          <input
            type="radio"
            name="opcion-brawlers-generales"
            value="ninguno"
            ${
              opcion === "ninguno"
                ? "checked"
                : ""
            }
          >

          <span>
            ✅ No prohibir ninguno
          </span>

        </label>

        <label
          class="brawler-general-opcion ${
            opcion === "prohibir-3"
              ? "seleccionado"
              : ""
          }"
        >

          <input
            type="radio"
            name="opcion-brawlers-generales"
            value="prohibir-3"
            ${
              opcion === "prohibir-3"
                ? "checked"
                : ""
            }
          >

          <span>
            🚫 Prohibir 3
          </span>

        </label>

      </div>

      ${
        opcion === "prohibir-3"
          ? `
            <div class="campo-brawlers-escritos">

              <label for="brawlers-escritos">
                Escribí los 3 brawlers
              </label>

              <textarea
                id="brawlers-escritos"
                rows="4"
                maxlength="180"
                placeholder="Ejemplo: Brawler 1, Brawler 2, Brawler 3"
              >${escaparHTML(
                respuestas.brawlersGenerales
                  .brawlersEscritos
              )}</textarea>

              <small>
                Separalos con comas.
              </small>

            </div>
          `
          : ""
      }

      <div class="campo-recomendacion-general">

        <label for="recomendacion-brawlers">
          Recomendación adicional
        </label>

        <textarea
          id="recomendacion-brawlers"
          rows="4"
          maxlength="400"
          placeholder="Explicá por qué deberían prohibirse o permitirse..."
        >${escaparHTML(
          respuestas.brawlersGenerales
            .recomendacion
        )}</textarea>

      </div>

    </section>
  `;

  activarEventosBrawlersGenerales();
}

/* =========================
   EVENTOS BRAWLERS GENERALES
========================= */

function activarEventosBrawlersGenerales() {
  const opciones =
    contenedorBrawlersGenerales
      .querySelectorAll(
        'input[name="opcion-brawlers-generales"]'
      );

  opciones.forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        respuestas.brawlersGenerales.opcion =
          radio.value;

        if (radio.value === "ninguno") {
          respuestas.brawlersGenerales
            .brawlersEscritos = "";
        }

        mensajeBrawlersGenerales.textContent =
          "";

        renderizarBrawlersGenerales();
      }
    );
  });

  const textareaBrawlers =
    document.getElementById(
      "brawlers-escritos"
    );

  if (textareaBrawlers) {
    textareaBrawlers.addEventListener(
      "input",
      () => {
        respuestas.brawlersGenerales
          .brawlersEscritos =
          textareaBrawlers.value;
      }
    );
  }

  const textareaRecomendacion =
    document.getElementById(
      "recomendacion-brawlers"
    );

  if (textareaRecomendacion) {
    textareaRecomendacion.addEventListener(
      "input",
      () => {
        respuestas.brawlersGenerales
          .recomendacion =
          textareaRecomendacion.value;
      }
    );
  }
}
/* =========================
   RENDERIZAR ENCUESTA
========================= */

function renderizarEncuesta() {
  if (!contenedorEncuesta) {
    return;
  }

  contenedorEncuesta.innerHTML =
    preguntasEncuesta.map((pregunta) => {
      const respuesta =
        respuestas.encuesta[pregunta.id];

      if (pregunta.tipo === "texto") {
        return `
          <section
            class="encuesta-bloque"
            data-pregunta="${escaparHTML(
              pregunta.id
            )}"
          >

            <h3 class="encuesta-pregunta">
              ${escaparHTML(
                pregunta.pregunta
              )}
            </h3>

            <textarea
              class="encuesta-textarea"
              data-encuesta-texto="${escaparHTML(
                pregunta.id
              )}"
              rows="5"
              maxlength="600"
              placeholder="${escaparHTML(
                pregunta.placeholder || ""
              )}"
            >${escaparHTML(
              respuesta || ""
            )}</textarea>

            <span class="contador-texto">
              <span
                data-contador-texto="${escaparHTML(
                  pregunta.id
                )}"
              >
                ${String(
                  respuesta || ""
                ).length}
              </span>
              / 600
            </span>

          </section>
        `;
      }

      if (pregunta.tipo === "estrellas") {
        return `
          <section
            class="encuesta-bloque"
            data-pregunta="${escaparHTML(
              pregunta.id
            )}"
          >

            <h3 class="encuesta-pregunta">
              ${escaparHTML(
                pregunta.pregunta
              )}
            </h3>

            <div class="estrellas-encuesta">

              ${pregunta.opciones.map(
                (numero) => `
                  <label
                    class="estrella-card ${
                      Number(respuesta) >= numero
                        ? "seleccionada"
                        : ""
                    }"
                  >

                    <input
                      type="radio"
                      name="encuesta-${escaparHTML(
                        pregunta.id
                      )}"
                      value="${numero}"
                      ${
                        Number(respuesta) === numero
                          ? "checked"
                          : ""
                      }
                    >

                    <span>★</span>

                  </label>
                `
              ).join("")}

            </div>

            <p class="texto-estrellas">
              ${
                respuesta
                  ? `${respuesta} de 5 estrellas`
                  : "Todavía no calificaste"
              }
            </p>

          </section>
        `;
      }

      if (pregunta.tipo === "opciones") {
        return `
          <section
            class="encuesta-bloque"
            data-pregunta="${escaparHTML(
              pregunta.id
            )}"
          >

            <h3 class="encuesta-pregunta">
              ${escaparHTML(
                pregunta.pregunta
              )}
            </h3>

            <div class="encuesta-opciones">

              ${pregunta.opciones.map(
                (opcion) => `
                  <label
                    class="encuesta-opcion-card ${
                      respuesta === opcion.valor
                        ? "seleccionado"
                        : ""
                    }"
                  >

                    <input
                      type="radio"
                      name="encuesta-${escaparHTML(
                        pregunta.id
                      )}"
                      value="${escaparHTML(
                        opcion.valor
                      )}"
                      ${
                        respuesta === opcion.valor
                          ? "checked"
                          : ""
                      }
                    >

                    <span>
                      ${escaparHTML(
                        opcion.texto
                      )}
                    </span>

                  </label>
                `
              ).join("")}

            </div>

          </section>
        `;
      }

      return "";
    }).join("");

  activarEventosEncuesta();
}

/* =========================
   EVENTOS DE ENCUESTA
========================= */

function activarEventosEncuesta() {
  const camposTexto =
    contenedorEncuesta.querySelectorAll(
      "[data-encuesta-texto]"
    );

  camposTexto.forEach((campo) => {
    campo.addEventListener(
      "input",
      () => {
        const preguntaId =
          campo.dataset.encuestaTexto;

        respuestas.encuesta[preguntaId] =
          campo.value;

        const contador =
          contenedorEncuesta.querySelector(
            `[data-contador-texto="${preguntaId}"]`
          );

        if (contador) {
          contador.textContent =
            campo.value.length;
        }

        mensajeEncuesta.textContent = "";
      }
    );
  });

  const radios =
    contenedorEncuesta.querySelectorAll(
      '.encuesta-bloque input[type="radio"]'
    );

  radios.forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        const preguntaId =
          radio.name.replace(
            "encuesta-",
            ""
          );

        const pregunta =
          preguntasEncuesta.find(
            (item) =>
              item.id === preguntaId
          );

        respuestas.encuesta[preguntaId] =
          pregunta?.tipo === "estrellas"
            ? Number(radio.value)
            : radio.value;

        mensajeEncuesta.textContent = "";

        renderizarEncuesta();
      }
    );
  });
}
/* =========================
   VALIDAR PASO ACTUAL
========================= */

function validarPasoActual() {
  /*
    PASO 1:
    Tiene que descartar exactamente 3 modos.
  */

  if (pasoActual === 1) {
    const cantidad =
      respuestas.modosDescartados.length;

    const requerida =
      configuracionModos
        .cantidadADescartar;

    if (cantidad !== requerida) {
      mensajeModos.textContent =
        `Tenés que elegir exactamente ${requerida} modos para descartar.`;

      mensajeModos.className =
        "mensaje-paso mensaje-error";

      document
        .getElementById("opciones-modos")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      return false;
    }

    mensajeModos.textContent =
      "✅ Modos descartados correctamente.";

    mensajeModos.className =
      "mensaje-paso mensaje-exito";
  }

  /*
    Los demás pasos todavía no tienen
    validación porque se agregarán después.
  */

/*
  PASO 2:
  Debe elegir un mapa para cada
  modo que siga disponible.
*/

if (pasoActual === 2) {
  const modosDisponibles =
    obtenerModosDisponibles();

  const modoSinMapa =
    modosDisponibles.find(
      (modo) =>
        !respuestas.mapas[modo.id]
    );

  if (modoSinMapa) {
    mensajeMapas.textContent =
      `Elegí un mapa para ${modoSinMapa.nombre}.`;

    mensajeMapas.className =
      "mensaje-paso mensaje-error";

    const grupo =
      contenedorMapas.querySelector(
        `[data-modo="${modoSinMapa.id}"]`
      );

    grupo?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    return false;
  }

  mensajeMapas.textContent =
    "✅ Mapas elegidos correctamente.";

  mensajeMapas.className =
    "mensaje-paso mensaje-exito";
}

/*
  PASO 3:
  Elegir modo y mapa de desempate
  solo si queda algún modo disponible.
*/

if (pasoActual === 3) {
  const modosDesempate =
    obtenerModosDesempateDisponibles();

  if (modosDesempate.length === 0) {
    return true;
  }

  if (!respuestas.desempate.modo) {
    mensajeDesempate.textContent =
      "Elegí un modo de desempate.";

    mensajeDesempate.className =
      "mensaje-paso mensaje-error";

    return false;
  }

  if (!respuestas.desempate.mapa) {
    mensajeDesempate.textContent =
      "Elegí un mapa para el desempate.";

    mensajeDesempate.className =
      "mensaje-paso mensaje-error";

    return false;
  }

  mensajeDesempate.textContent =
    "✅ Desempate configurado correctamente.";

  mensajeDesempate.className =
    "mensaje-paso mensaje-exito";
}

/*
  PASO 4:
  Debe responder todas las reglas.
*/

if (pasoActual === 4) {
  const reglaSinRespuesta =
    reglasFinal.find(
      (regla) =>
        !respuestas.reglas[regla.id]
    );

  if (reglaSinRespuesta) {
    mensajeReglas.textContent =
      `Elegí una opción para ${reglaSinRespuesta.nombre}.`;

    mensajeReglas.className =
      "mensaje-paso mensaje-error";

    const bloque =
      contenedorReglas.querySelector(
        `input[name="regla-${reglaSinRespuesta.id}"]`
      )?.closest(".regla-bloque");

    bloque?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    return false;
  }

  mensajeReglas.textContent =
    "✅ Reglas completadas correctamente.";

  mensajeReglas.className =
    "mensaje-paso mensaje-exito";
}

  /*
  PASO 5:
  Configuración de brawlers con buffies.
*/

if (pasoActual === 5) {
  const opcion =
    obtenerOpcionBuffies();

  if (!opcion) {
    mensajeBuffies.textContent =
      "Elegí una opción para los brawlers con buffies.";

    mensajeBuffies.className =
      "mensaje-paso mensaje-error";

    return false;
  }

  if (
    typeof opcion.cantidadBloqueos ===
      "number" &&
    opcion.cantidadBloqueos > 0
  ) {
    const cantidadElegida =
      respuestas.buffies.bloqueados
        .length;

    if (
      cantidadElegida !==
      opcion.cantidadBloqueos
    ) {
      mensajeBuffies.textContent =
        `Tenés que bloquear exactamente ${opcion.cantidadBloqueos} brawlers.`;

      mensajeBuffies.className =
        "mensaje-paso mensaje-error";

      return false;
    }
  }

  mensajeBuffies.textContent =
    "✅ Brawlers con buffies configurados.";

  mensajeBuffies.className =
    "mensaje-paso mensaje-exito";
}
  /*
  PASO 6:
  Recomendaciones de brawlers generales.
*/

if (pasoActual === 6) {
  const datos =
    respuestas.brawlersGenerales;

  if (!datos.opcion) {
    mensajeBrawlersGenerales.textContent =
      "Elegí si querés prohibir brawlers o no.";

    mensajeBrawlersGenerales.className =
      "mensaje-paso mensaje-error";

    return false;
  }

  if (datos.opcion === "prohibir-3") {
    const nombres =
      datos.brawlersEscritos
        .split(",")
        .map((nombre) => nombre.trim())
        .filter(Boolean);

    if (nombres.length !== 3) {
      mensajeBrawlersGenerales.textContent =
        "Escribí exactamente 3 brawlers separados por comas.";

      mensajeBrawlersGenerales.className =
        "mensaje-paso mensaje-error";

      return false;
    }
  }

  mensajeBrawlersGenerales.textContent =
    "✅ Recomendación completada.";

  mensajeBrawlersGenerales.className =
    "mensaje-paso mensaje-exito";
}
  /*
  PASO 7:
  Encuesta final.
*/

if (pasoActual === 7) {
  const preguntaSinRespuesta =
    preguntasEncuesta.find(
      (pregunta) => {
        const respuesta =
          respuestas.encuesta[
            pregunta.id
          ];

        if (pregunta.tipo === "texto") {
          return !String(
            respuesta || ""
          ).trim();
        }

        return (
          respuesta === undefined ||
          respuesta === null ||
          respuesta === ""
        );
      }
    );

  if (preguntaSinRespuesta) {
    mensajeEncuesta.textContent =
      "Respondé todas las preguntas antes de continuar.";

    mensajeEncuesta.className =
      "mensaje-paso mensaje-error";

    const bloque =
      contenedorEncuesta.querySelector(
        `[data-pregunta="${preguntaSinRespuesta.id}"]`
      );

    bloque?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    return false;
  }

  mensajeEncuesta.textContent =
    "✅ Encuesta completada. Ya podés ver el resumen.";

  mensajeEncuesta.className =
    "mensaje-paso mensaje-exito";
}
  return true;
}

/* =========================
   MOSTRAR PASO
========================= */

function actualizarPaso() {
    pantallaResumen.classList.remove(
    "activo"
  );

  mostrandoResumen = false;
  const pasos =
    document.querySelectorAll(
      ".paso"
    );

  pasos.forEach((paso) => {
    const numero =
      Number(paso.dataset.paso);

    paso.classList.toggle(
      "activo",
      numero === pasoActual
    );
  });

  const porcentaje =
    Math.round(
      (
        pasoActual /
        TOTAL_PASOS
      ) * 100
    );

  textoPaso.textContent =
    `Paso ${pasoActual} de ${TOTAL_PASOS}`;

  porcentajePaso.textContent =
    `${porcentaje}%`;

  barraProgreso.style.width =
    `${porcentaje}%`;

  botonAnterior.disabled =
    pasoActual === 1;

  botonSiguiente.textContent =
    pasoActual === TOTAL_PASOS
      ? "VER RESUMEN →"
      : "SIGUIENTE →";

 if (pasoActual === 2) {
  renderizarMapas();
}

if (pasoActual === 3) {
  renderizarDesempate();
}

  if (pasoActual === 4) {
  renderizarReglas();
}

  if (pasoActual === 5) {
  renderizarBuffies();
}
  if (pasoActual === 6) {
  renderizarBrawlersGenerales();
}
  if (pasoActual === 7) {
  renderizarEncuesta();
}
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
/* =========================
   CAMBIAR PASOS
========================= */

function irSiguiente() {
  if (mostrandoResumen) {
    enviarDecisiones();
    return;
  }

  const valido =
    validarPasoActual();

  if (!valido) {
    return;
  }

  if (pasoActual < TOTAL_PASOS) {
    pasoActual++;
    actualizarPaso();
    return;
  }

  mostrarResumen();
}
/* =========================
   BUSCAR NOMBRE DE MODO
========================= */

function obtenerNombreModo(modoId) {
  const modo = modosFinal.find(
    (item) => item.id === modoId
  );

  return modo
    ? `${modo.icono} ${modo.nombre}`
    : modoId;
}

/* =========================
   BUSCAR TEXTO DE REGLA
========================= */

function obtenerTextoRegla(
  reglaId,
  valor
) {
  const regla = reglasFinal.find(
    (item) => item.id === reglaId
  );

  const opcion = regla?.opciones.find(
    (item) => item.valor === valor
  );

  return opcion?.texto || valor;
}

/* =========================
   BUSCAR TEXTO DE ENCUESTA
========================= */

function obtenerTextoEncuesta(
  preguntaId,
  valor
) {
  const pregunta =
    preguntasEncuesta.find(
      (item) => item.id === preguntaId
    );

  if (
    pregunta?.tipo === "opciones"
  ) {
    return (
      pregunta.opciones.find(
        (opcion) =>
          opcion.valor === valor
      )?.texto || valor
    );
  }

  if (
    pregunta?.tipo === "estrellas"
  ) {
    return `${valor} de 5 estrellas`;
  }

  return valor;
}

/* =========================
   CREAR RESUMEN
========================= */

function renderizarResumen() {
  if (
    !contenidoResumen ||
    !jugadorActual
  ) {
    return;
  }

  const modosDescartadosHTML =
    respuestas.modosDescartados
      .map(
        (modoId) => `
          <li>
            ${escaparHTML(
              obtenerNombreModo(modoId)
            )}
          </li>
        `
      )
      .join("");

  const mapasHTML =
    Object.entries(respuestas.mapas)
      .map(([modoId, mapa]) => `
        <div class="resumen-fila">

          <span>
            ${escaparHTML(
              obtenerNombreModo(modoId)
            )}
          </span>

          <strong>
            ${escaparHTML(mapa)}
          </strong>

        </div>
      `)
      .join("");

  const reglasHTML =
    Object.entries(respuestas.reglas)
      .map(([reglaId, valor]) => {
        const regla =
          reglasFinal.find(
            (item) =>
              item.id === reglaId
          );

        return `
          <div class="resumen-fila">

            <span>
              ${escaparHTML(
                regla?.nombre || reglaId
              )}
            </span>

            <strong>
              ${escaparHTML(
                obtenerTextoRegla(
                  reglaId,
                  valor
                )
              )}
            </strong>

          </div>
        `;
      })
      .join("");

  const buffiesBloqueados =
    respuestas.buffies.bloqueados
      .length > 0
      ? respuestas.buffies.bloqueados
          .map(
            (brawler) => `
              <li>
                ${escaparHTML(brawler)}
              </li>
            `
          )
          .join("")
      : `
          <li>
            Ninguno
          </li>
        `;

  const encuestaHTML =
    preguntasEncuesta.map(
      (pregunta) => {
        const valor =
          respuestas.encuesta[
            pregunta.id
          ];

        return `
          <div class="resumen-pregunta">

            <span>
              ${escaparHTML(
                pregunta.pregunta
              )}
            </span>

            <p>
              ${escaparHTML(
                obtenerTextoEncuesta(
                  pregunta.id,
                  valor
                )
              )}
            </p>

          </div>
        `;
      }
    ).join("");

  contenidoResumen.innerHTML = `
    <section class="resumen-bloque">

      <h3>
        👤 Finalista
      </h3>

      <div class="resumen-fila">
        <span>Jugador</span>

        <strong>
          ${escaparHTML(
            jugadorActual.nombre
          )}
        </strong>
      </div>

      <div class="resumen-fila">
        <span>Equipo</span>

        <strong>
          ${escaparHTML(
            jugadorActual.equipo
          )}
        </strong>
      </div>

    </section>

    <section class="resumen-bloque">

      <h3>
        🚫 Modos descartados
      </h3>

      <ul class="resumen-lista">
        ${modosDescartadosHTML}
      </ul>

    </section>

    <section class="resumen-bloque">

      <h3>
        🗺️ Mapas elegidos
      </h3>

      ${mapasHTML}

    </section>

    <section class="resumen-bloque">

      <h3>
        🎯 Desempate
      </h3>

      ${
        respuestas.desempate.modo
          ? `
            <div class="resumen-fila">

              <span>Modo</span>

              <strong>
                ${escaparHTML(
                  obtenerNombreModo(
                    respuestas.desempate
                      .modo
                  )
                )}
              </strong>

            </div>

            <div class="resumen-fila">

              <span>Mapa</span>

              <strong>
                ${escaparHTML(
                  respuestas.desempate
                    .mapa
                )}
              </strong>

            </div>
          `
          : `
            <p class="resumen-vacio">
              No se eligió desempate porque
              todos los modos disponibles
              fueron descartados.
            </p>
          `
      }

    </section>

    <section class="resumen-bloque">

      <h3>
        📜 Reglas
      </h3>

      ${reglasHTML}

    </section>

    <section class="resumen-bloque">

      <h3>
        ⚡ Brawlers con buffies
      </h3>

      <div class="resumen-fila">

        <span>Decisión</span>

        <strong>
          ${escaparHTML(
            respuestas.buffies.opcion
          )}
        </strong>

      </div>

      <p class="resumen-subtitulo">
        Bloqueados:
      </p>

      <ul class="resumen-lista">
        ${buffiesBloqueados}
      </ul>

    </section>

    <section class="resumen-bloque">

      <h3>
        🎮 Brawlers generales
      </h3>

      <div class="resumen-fila">

        <span>Decisión</span>

        <strong>
          ${escaparHTML(
            respuestas
              .brawlersGenerales
              .opcion
          )}
        </strong>

      </div>

      ${
        respuestas
          .brawlersGenerales
          .brawlersEscritos
          ? `
            <div class="resumen-texto">

              <strong>
                Brawlers propuestos
              </strong>

              <p>
                ${escaparHTML(
                  respuestas
                    .brawlersGenerales
                    .brawlersEscritos
                )}
              </p>

            </div>
          `
          : ""
      }

      ${
        respuestas
          .brawlersGenerales
          .recomendacion
          ? `
            <div class="resumen-texto">

              <strong>
                Recomendación
              </strong>

              <p>
                ${escaparHTML(
                  respuestas
                    .brawlersGenerales
                    .recomendacion
                )}
              </p>

            </div>
          `
          : ""
      }

    </section>

    <section class="resumen-bloque">

      <h3>
        💬 Encuesta
      </h3>

      ${encuestaHTML}

    </section>
  `;
}

/* =========================
   MOSTRAR RESUMEN
========================= */

function mostrarResumen() {
  mostrandoResumen = true;

  document
    .querySelectorAll(".paso")
    .forEach((paso) => {
      paso.classList.remove("activo");
    });

  pantallaResumen.classList.add(
    "activo"
  );

  textoPaso.textContent =
    "Resumen final";

  porcentajePaso.textContent =
    "100%";

  barraProgreso.style.width =
    "100%";

  botonAnterior.disabled = false;

  botonSiguiente.textContent =
    "ENVIAR DECISIONES";

  renderizarResumen();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================
   OCULTAR RESUMEN
========================= */

function ocultarResumen() {
  mostrandoResumen = false;

  pantallaResumen.classList.remove(
    "activo"
  );

  pasoActual = TOTAL_PASOS;

  actualizarPaso();
}

/* =========================
   CREAR ID DE DOCUMENTO
========================= */

function crearIdVoto(codigo) {
  return String(codigo)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}

/* =========================
   GUARDAR VOTO EN FIREBASE
========================= */

async function enviarDecisiones() {
  if (
    !jugadorActual ||
    envioRealizado
  ) {
    return;
  }

  const idDocumento =
    crearIdVoto(
      jugadorActual.codigo
    );

  const referencia = doc(
    db,
    "salaFinalVotos",
    idDocumento
  );

  try {
    botonSiguiente.disabled = true;

    botonSiguiente.textContent =
      "ENVIANDO...";

    mensajeEnvio.textContent = "";

    await runTransaction(
      db,
      async (transaccion) => {
        const documento =
          await transaccion.get(
            referencia
          );

        if (documento.exists()) {
          throw new Error(
            "VOTO_YA_ENVIADO"
          );
        }

        transaccion.set(
          referencia,
          {
            codigo:
              jugadorActual.codigo,

            nombre:
              jugadorActual.nombre,

            equipo:
              jugadorActual.equipo,

            equipoId:
              jugadorActual.equipoId,

            respuestas:
              structuredClone(
                respuestas
              ),

            completado: true,

            fecha:
              serverTimestamp()
          }
        );
      }
    );

    envioRealizado = true;

    mensajeEnvio.textContent =
      "✅ Tus decisiones fueron enviadas correctamente.";

    mensajeEnvio.className =
      "mensaje-paso mensaje-exito";

    botonSiguiente.textContent =
      "✅ DECISIONES ENVIADAS";

    alert(
      "✅ Votación enviada correctamente. Gracias por participar en la Gran Final de Nova Clash."
    );

  } catch (error) {
    console.error(
      "Error al enviar:",
      error
    );

    if (
      error.message ===
      "VOTO_YA_ENVIADO"
    ) {
      mensajeEnvio.textContent =
        "Este código ya envió sus decisiones.";

      mensajeEnvio.className =
        "mensaje-paso mensaje-error";

      botonSiguiente.textContent =
        "VOTO YA ENVIADO";

      botonSiguiente.disabled = true;

      return;
    }

    mensajeEnvio.textContent =
      "No se pudieron enviar las decisiones. Intentá nuevamente.";

    mensajeEnvio.className =
      "mensaje-paso mensaje-error";

    botonSiguiente.disabled = false;

    botonSiguiente.textContent =
      "ENVIAR DECISIONES";
  }
}
function irAnterior() {
  if (mostrandoResumen) {
    ocultarResumen();
    return;
  }

  if (pasoActual > 1) {
    pasoActual--;
    actualizarPaso();
  }
}

/* =========================
   EVENTOS
========================= */

botonIngresar.addEventListener(
  "click",
  ingresarSala
);

inputCodigo.addEventListener(
  "keydown",
  (evento) => {
    if (evento.key === "Enter") {
      ingresarSala();
    }
  }
);

botonSiguiente.addEventListener(
  "click",
  irSiguiente
);

botonAnterior.addEventListener(
  "click",
  irAnterior
);

console.log(
  "SALA FINAL LAB V2 LISTA"
);
