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

const TOTAL_PASOS =
  pasosSalaFinal.length;

let pasoActual = 1;
let jugadorActual = null;

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
    bloqueados: []
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
  console.log("Reglas recibidas:", reglasFinal);

  if (!contenedorReglas) {
    console.error(
      "No existe #contenedor-reglas"
    );

    return;
  }

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
  
  return true;
}

/* =========================
   MOSTRAR PASO
========================= */

function actualizarPaso() {
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
  
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

if (pasoActual === 4) {
  renderizarReglas();
}
/* =========================
   CAMBIAR PASOS
========================= */

function irSiguiente() {
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

  console.log(
    "Respuestas actuales:",
    respuestas
  );

  alert(
    "La pantalla de resumen será agregada después."
  );
}

function irAnterior() {
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
