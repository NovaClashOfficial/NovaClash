console.log("LABORATORIO NOVA CLASH");

const CLAVE_LOCAL = "novaClashLaboratorio";

/*
    Equipos de prueba.

    Cuando terminen los Octavos podés reemplazarlos
    por los 8 ganadores reales.
*/

const equiposIniciales = [
    "Ganador Octavos 1",
    "Ganador Octavos 2",
    "Ganador Octavos 3",
    "Ganador Octavos 4",
    "Ganador Octavos 5",
    "Ganador Octavos 6",
    "Ganador Octavos 7",
    "Ganador Octavos 8"
];

const faseDev = document.getElementById("faseDev");
const estadoDev = document.getElementById("estadoDev");

const partidosDev =
    document.getElementById("partidosDev");

const vistaEstado =
    document.getElementById("vistaEstado");

const campeonDev =
    document.getElementById("campeonDev");

const guardarDev =
    document.getElementById("guardarDev");

const reiniciarDev =
    document.getElementById("reiniciarDev");

/* =========================
   ESTADO INICIAL
========================= */

let laboratorio = cargarLaboratorio() || {
    fase: "cuartos",
    estado: "abiertas",

    resultados: {
        cuartos: [],
        semifinal: [],
        final: []
    }
};

faseDev.value = laboratorio.fase;
estadoDev.value = laboratorio.estado;

/* =========================
   UTILIDADES
========================= */

function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function cargarLaboratorio() {
    try {
        const datos =
            localStorage.getItem(CLAVE_LOCAL);

        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error(
            "No se pudo cargar el laboratorio:",
            error
        );

        return null;
    }
}

function guardarLaboratorio() {
    localStorage.setItem(
        CLAVE_LOCAL,
        JSON.stringify(laboratorio)
    );
}

function obtenerResultado(fase, partido) {
    return laboratorio.resultados[fase].find(
        (resultado) =>
            Number(resultado.partido) ===
            Number(partido)
    );
}

/* =========================
   GENERAR ENFRENTAMIENTOS
========================= */

function obtenerPartidosCuartos() {
    return [
        [equiposIniciales[0], equiposIniciales[1]],
        [equiposIniciales[2], equiposIniciales[3]],
        [equiposIniciales[4], equiposIniciales[5]],
        [equiposIniciales[6], equiposIniciales[7]]
    ];
}

function obtenerGanadores(faseAnterior, cantidad) {
    const ganadores = [];

    for (let i = 1; i <= cantidad; i++) {
        const resultado =
            obtenerResultado(faseAnterior, i);

        ganadores.push(
            resultado?.ganador ||
            `Ganador ${faseAnterior} ${i}`
        );
    }

    return ganadores;
}

function obtenerPartidosSemifinal() {
    const ganadores =
        obtenerGanadores("cuartos", 4);

    return [
        [ganadores[0], ganadores[1]],
        [ganadores[2], ganadores[3]]
    ];
}

function obtenerPartidosFinal() {
    const ganadores =
        obtenerGanadores("semifinal", 2);

    return [
        [ganadores[0], ganadores[1]]
    ];
}

function obtenerPartidos(fase) {
    if (fase === "cuartos") {
        return obtenerPartidosCuartos();
    }

    if (fase === "semifinal") {
        return obtenerPartidosSemifinal();
    }

    if (fase === "final") {
        return obtenerPartidosFinal();
    }

    return [];
}

/* =========================
   MOSTRAR ESTADO
========================= */

function mostrarEstado() {
    const estaAbierto =
        laboratorio.estado === "abiertas";

    vistaEstado.innerHTML = `
        <h2>
            ${
                estaAbierto
                    ? "🟢 Predicciones abiertas"
                    : "🔴 Predicciones cerradas"
            }
        </h2>

        <p>
            Vista de prueba:
            <strong>
                ${escaparHTML(
                    nombreFase(laboratorio.fase)
                )}
            </strong>
        </p>

        <p>
            Nada de esta página se guarda en Firebase.
        </p>
    `;
}

function nombreFase(fase) {
    const nombres = {
        cuartos: "Cuartos de Final",
        semifinal: "Semifinal",
        final: "Final"
    };

    return nombres[fase] || fase;
}

/* =========================
   RENDERIZAR PARTIDOS
========================= */

function renderizarPartidos() {
    mostrarEstado();

    partidosDev.innerHTML = "";

    const partidos =
        obtenerPartidos(laboratorio.fase);

    const estaCerrado =
        laboratorio.estado === "cerradas";

    partidos.forEach((partido, indice) => {
        const numeroPartido = indice + 1;
        const [equipo1, equipo2] = partido;

        const resultadoGuardado =
            obtenerResultado(
                laboratorio.fase,
                numeroPartido
            );

        const tarjeta =
            document.createElement("article");

        tarjeta.className = "dev-partido";

        tarjeta.innerHTML = `
            <h2>
                Partido ${numeroPartido}
            </h2>

            <div class="dev-enfrentamiento">

                <label class="dev-equipo">
                    <input
                        type="radio"
                        name="ganador-${numeroPartido}"
                        value="${escaparHTML(equipo1)}"
                        ${
                            resultadoGuardado?.ganador ===
                            equipo1
                                ? "checked"
                                : ""
                        }
                        ${estaCerrado ? "disabled" : ""}
                    >

                    <span>
                        ${escaparHTML(equipo1)}
                    </span>
                </label>

                <strong class="dev-vs">
                    VS
                </strong>

                <label class="dev-equipo">
                    <input
                        type="radio"
                        name="ganador-${numeroPartido}"
                        value="${escaparHTML(equipo2)}"
                        ${
                            resultadoGuardado?.ganador ===
                            equipo2
                                ? "checked"
                                : ""
                        }
                        ${estaCerrado ? "disabled" : ""}
                    >

                    <span>
                        ${escaparHTML(equipo2)}
                    </span>
                </label>

            </div>

            <div class="dev-marcadores">

                <label class="dev-marcador">
                    <input
                        type="radio"
                        name="marcador-${numeroPartido}"
                        value="2-0"
                        ${
                            resultadoGuardado?.resultado ===
                            "2-0"
                                ? "checked"
                                : ""
                        }
                        ${estaCerrado ? "disabled" : ""}
                    >

                    <span>2-0</span>
                </label>

                <label class="dev-marcador">
                    <input
                        type="radio"
                        name="marcador-${numeroPartido}"
                        value="2-1"
                        ${
                            resultadoGuardado?.resultado ===
                            "2-1"
                                ? "checked"
                                : ""
                        }
                        ${estaCerrado ? "disabled" : ""}
                    >

                    <span>2-1</span>
                </label>

            </div>

            <p
                class="dev-estado"
                id="estado-${numeroPartido}"
            >
                ${
                    resultadoGuardado
                        ? `Ganador simulado: ${
                            escaparHTML(
                                resultadoGuardado.ganador
                            )
                        } ${
                            escaparHTML(
                                resultadoGuardado.resultado
                            )
                        }`
                        : "Sin resultado simulado"
                }
            </p>
        `;

        partidosDev.appendChild(tarjeta);
    });

    mostrarCampeon();
}

/* =========================
   LEER SELECCIONES
========================= */

function leerResultadosActuales() {
    const partidos =
        obtenerPartidos(laboratorio.fase);

    const resultados = [];

    for (
        let indice = 0;
        indice < partidos.length;
        indice++
    ) {
        const numeroPartido = indice + 1;

        const ganador =
            document.querySelector(
                `input[name="ganador-${numeroPartido}"]:checked`
            )?.value;

        const resultado =
            document.querySelector(
                `input[name="marcador-${numeroPartido}"]:checked`
            )?.value;

        if (!ganador || !resultado) {
            throw new Error(
                `Completa el partido ${numeroPartido}.`
            );
        }

        resultados.push({
            partido: numeroPartido,
            ganador,
            resultado
        });
    }

    return resultados;
}

/* =========================
   CAMPEÓN
========================= */

function mostrarCampeon() {
    const final =
        obtenerResultado("final", 1);

    if (!final?.ganador) {
        campeonDev.classList.add("dev-oculto");
        campeonDev.innerHTML = "";
        return;
    }

    campeonDev.classList.remove("dev-oculto");

    campeonDev.innerHTML = `
        <div style="font-size: 42px;">
            ⭐ 🏆 ⭐
        </div>

        <h2>
            ${escaparHTML(final.ganador)}
        </h2>

        <h3>
            CAMPEÓN DE NOVA CLASH
        </h3>

        <p>
            Resultado de la final:
            <strong>
                ${escaparHTML(final.resultado)}
            </strong>
        </p>
    `;
}

/* =========================
   EVENTOS
========================= */

faseDev.addEventListener("change", () => {
    laboratorio.fase = faseDev.value;

    guardarLaboratorio();
    renderizarPartidos();
});

estadoDev.addEventListener("change", () => {
    laboratorio.estado = estadoDev.value;

    guardarLaboratorio();
    renderizarPartidos();
});

guardarDev.addEventListener("click", () => {
    if (laboratorio.estado === "cerradas") {
        alert(
            "La vista está en modo cerrado. " +
            "Cambiá el estado a abiertas para editar."
        );

        return;
    }

    try {
        const resultados =
            leerResultadosActuales();

        laboratorio.resultados[
            laboratorio.fase
        ] = resultados;

        guardarLaboratorio();
        renderizarPartidos();

        alert(
            `${nombreFase(laboratorio.fase)} ` +
            "guardada solamente en modo prueba."
        );
    } catch (error) {
        alert(error.message);
    }
});

reiniciarDev.addEventListener("click", () => {
    const confirmar = confirm(
        "¿Querés borrar toda la simulación?"
    );

    if (!confirmar) return;

    localStorage.removeItem(CLAVE_LOCAL);

    laboratorio = {
        fase: "cuartos",
        estado: "abiertas",

        resultados: {
            cuartos: [],
            semifinal: [],
            final: []
        }
    };

    faseDev.value = "cuartos";
    estadoDev.value = "abiertas";

    renderizarPartidos();
});

/* =========================
   INICIAR
========================= */

renderizarPartidos();
