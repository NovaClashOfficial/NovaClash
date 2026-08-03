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

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
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
