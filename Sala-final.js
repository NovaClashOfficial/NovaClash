console.log("SALA FINAL LAB V1");

const jugadoresFinalistas = {
  "BC-JAIRO": {
    nombre: "Jairo",
    equipo: "Black Cat"
  },

  "BC-DEMI": {
    nombre: "Demi",
    equipo: "Black Cat"
  },

  "BC-ALEX": {
    nombre: "Alex",
    equipo: "Black Cat"
  },

  "C8-PLAYER1": {
    nombre: "Jugador Community 1",
    equipo: "Community 8"
  },

  "C8-PLAYER2": {
    nombre: "Jugador Community 2",
    equipo: "Community 8"
  },

  "C8-PLAYER3": {
    nombre: "Jugador Community 3",
    equipo: "Community 8"
  }
};

const TOTAL_PASOS = 7;

let pasoActual = 1;
let jugadorActual = null;

const pantallaAcceso =
  document.getElementById("pantalla-acceso");

const pantallaSala =
  document.getElementById("pantalla-sala");

const inputCodigo =
  document.getElementById("codigo-acceso");

const botonIngresar =
  document.getElementById("btn-ingresar");

const mensajeAcceso =
  document.getElementById("mensaje-acceso");

const nombreJugador =
  document.getElementById("nombre-jugador");

const equipoJugador =
  document.getElementById("equipo-jugador");

const textoPaso =
  document.getElementById("texto-paso");

const porcentajePaso =
  document.getElementById("porcentaje-paso");

const barraProgreso =
  document.getElementById(
    "barra-progreso-activa"
  );

const botonAnterior =
  document.getElementById("btn-anterior");

const botonSiguiente =
  document.getElementById("btn-siguiente");

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
    normalizarCodigo(inputCodigo.value);

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

  pantallaAcceso.classList.remove(
    "activa"
  );

  pantallaSala.classList.add(
    "activa"
  );

  pasoActual = 1;

  actualizarPaso();
}

/* =========================
   MOSTRAR PASO
========================= */

function actualizarPaso() {
  const pasos =
    document.querySelectorAll(".paso");

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
      (pasoActual / TOTAL_PASOS) * 100
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
  if (pasoActual < TOTAL_PASOS) {
    pasoActual++;
    actualizarPaso();

    return;
  }

  alert(
    "La pantalla de resumen será el siguiente paso del desarrollo."
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

console.log("SALA FINAL LAB LISTA");
