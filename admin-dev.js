console.log("LABORATORIO NOVA CLASH - PREDICCIONES ESPECIALES");

const CLAVE_LOCAL = "novaClashLaboratorio";

/* =========================================
   EQUIPOS Y JUGADORES DE CUARTOS
   Cambialos cuando estén definidos.
========================================= */

const equiposIniciales = [
    {
        nombre: "Ganador Octavos 1",
        jugadores: [
            "Jugador 1A",
            "Jugador 1B",
            "Jugador 1C"
        ]
    },
    {
        nombre: "Ganador Octavos 2",
        jugadores: [
            "Jugador 2A",
            "Jugador 2B",
            "Jugador 2C"
        ]
    },
    {
        nombre: "Ganador Octavos 3",
        jugadores: [
            "Jugador 3A",
            "Jugador 3B",
            "Jugador 3C"
        ]
    },
    {
        nombre: "Ganador Octavos 4",
        jugadores: [
            "Jugador 4A",
            "Jugador 4B",
            "Jugador 4C"
        ]
    },
    {
        nombre: "Ganador Octavos 5",
        jugadores: [
            "Jugador 5A",
            "Jugador 5B",
            "Jugador 5C"
        ]
    },
    {
        nombre: "Ganador Octavos 6",
        jugadores: [
            "Jugador 6A",
            "Jugador 6B",
            "Jugador 6C"
        ]
    },
    {
        nombre: "Ganador Octavos 7",
        jugadores: [
            "Jugador 7A",
            "Jugador 7B",
            "Jugador 7C"
        ]
    },
    {
        nombre: "Ganador Octavos 8",
        jugadores: [
            "Jugador 8A",
            "Jugador 8B",
            "Jugador 8C"
        ]
    }
];

/* =========================================
   ELEMENTOS DEL HTML
========================================= */

const faseDev =
    document.getElementById("faseDev");

const estadoDev =
    document.getElementById("estadoDev");

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

/* =========================================
   ESTADO DEL LABORATORIO
========================================= */

let laboratorio = cargarLaboratorio() || crearEstadoInicial();

/*
    Esto completa propiedades faltantes si ya tenías
    una simulación guardada con la versión anterior.
*/

laboratorio.fase ||= "cuartos";
laboratorio.estado ||= "abiertas";

laboratorio.resultados ||= {
    cuartos: [],
    semifinal: [],
    final: []
};

laboratorio.resultados.cuartos ||= [];
laboratorio.resultados.semifinal ||= [];
laboratorio.resultados.final ||= [];

faseDev.value = laboratorio.fase;
estadoDev.value = laboratorio.estado;

/* =========================================
   FUNCIONES GENERALES
========================================= */

function crearEstadoInicial() {
    return {
        fase: "cuartos",
        estado: "abiertas",

        resultados: {
            cuartos: [],
            semifinal: [],
            final: []
        }
    };
}

function escaparHTML(texto) {
    return String(texto ?? "")
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

        return datos
            ? JSON.parse(datos)
            : null;

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

function nombreFase(fase) {
    const nombres = {
        cuartos: "Cuartos de Final",
        semifinal: "Semifinal",
        final: "Final"
    };

    return nombres[fase] || fase;
}

function obtenerResultado(fase, partido) {
    return laboratorio.resultados[fase].find(
        (resultado) =>
            Number(resultado.partido) ===
            Number(partido)
    );
}

function buscarEquipo(nombreEquipo) {
    return equiposIniciales.find(
        (equipo) =>
            equipo.nombre === nombreEquipo
    );
}

function equipoProvisional(nombre) {
    return {
        nombre,
        jugadores: [
            "Jugador por definir 1",
            "Jugador por definir 2",
            "Jugador por definir 3"
        ]
    };
}

/* =========================================
   CREAR PARTIDOS
========================================= */

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

    for (
        let numeroPartido = 1;
        numeroPartido <= cantidad;
        numeroPartido++
    ) {
        const resultado =
            obtenerResultado(
                faseAnterior,
                numeroPartido
            );

        if (resultado?.ganador) {
            const equipo =
                buscarEquipo(resultado.ganador);

            ganadores.push(
                equipo ||
                equipoProvisional(resultado.ganador)
            );

        } else {
            ganadores.push(
                equipoProvisional(
                    `Ganador ${nombreFase(
                        faseAnterior
                    )} ${numeroPartido}`
                )
            );
        }
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

/* =========================================
   ESTADO DE LA PÁGINA
========================================= */

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
            Fase de prueba:
            <strong>
                ${escaparHTML(
                    nombreFase(laboratorio.fase)
                )}
            </strong>
        </p>

        <p>
            Esta simulación se guarda solamente
            en tu navegador. No modifica Firebase.
        </p>
    `;
}

/* =========================================
   OPCIONES DE HIPERCARGAS
========================================= */

function crearOpcionesHipercargas(
    numeroPartido,
    resultadoGuardado,
    estaCerrado
) {
    const opciones = [
        {
            valor: "0-2",
            texto: "0 a 2"
        },
        {
            valor: "3-5",
            texto: "3 a 5"
        },
        {
            valor: "6-10",
            texto: "6 a 10"
        },
        {
            valor: "mas-10",
            texto: "Más de 10"
        }
    ];

    return opciones.map((opcion) => `
        <label class="dev-marcador">

            <input
                type="radio"
                name="hipercargas-${numeroPartido}"
                value="${opcion.valor}"

                ${
                    resultadoGuardado?.hipercargas ===
                    opcion.valor
                        ? "checked"
                        : ""
                }

                ${estaCerrado ? "disabled" : ""}
            >

            <span>
                ⚡ ${opcion.texto}
            </span>

        </label>
    `).join("");
}

/* =========================================
   OPCIONES DE MVP
========================================= */

function crearOpcionesMVP(
    numeroPartido,
    equipo1,
    equipo2,
    resultadoGuardado,
    estaCerrado
) {
    const jugadores = [
        ...equipo1.jugadores.map((jugador) => ({
            nombre: jugador,
            equipo: equipo1.nombre
        })),

        ...equipo2.jugadores.map((jugador) => ({
            nombre: jugador,
            equipo: equipo2.nombre
        }))
    ];

    return jugadores.map((jugador) => `
        <label class="dev-marcador">

            <input
                type="radio"
                name="mvp-${numeroPartido}"
                value="${escaparHTML(jugador.nombre)}"

                ${
                    resultadoGuardado?.mvp ===
                    jugador.nombre
                        ? "checked"
                        : ""
                }

                ${estaCerrado ? "disabled" : ""}
            >

            <span>
                ⭐ ${escaparHTML(jugador.nombre)}
                <small
                    style="
                        display:block;
                        margin-top:4px;
                        opacity:0.7;
                    "
                >
                    ${escaparHTML(jugador.equipo)}
                </small>
            </span>

        </label>
    `).join("");
}

/* =========================================
   RENDERIZAR LOS PARTIDOS
========================================= */

function renderizarPartidos() {
    mostrarEstado();

    partidosDev.innerHTML = "";

    const partidos =
        obtenerPartidos(laboratorio.fase);

    const estaCerrado =
        laboratorio.estado === "cerradas";

    const esCuartos =
        laboratorio.fase === "cuartos";

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
                        value="${escaparHTML(equipo1.nombre)}"

                        ${
                            resultadoGuardado?.ganador ===
                            equipo1.nombre
                                ? "checked"
                                : ""
                        }

                        ${estaCerrado ? "disabled" : ""}
                    >

                    <span>
                        ${escaparHTML(equipo1.nombre)}
                    </span>

                </label>

                <strong class="dev-vs">
                    VS
                </strong>

                <label class="dev-equipo">

                    <input
                        type="radio"
                        name="ganador-${numeroPartido}"
                        value="${escaparHTML(equipo2.nombre)}"

                        ${
                            resultadoGuardado?.ganador ===
                            equipo2.nombre
                                ? "checked"
                                : ""
                        }

                        ${estaCerrado ? "disabled" : ""}
                    >

                    <span>
                        ${escaparHTML(equipo2.nombre)}
                    </span>

                </label>

            </div>

            <h3>
                🎯 Marcador final
            </h3>

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

            ${
                esCuartos
                    ? `
                        <hr style="margin:25px 0;">

                        <h3>
                            ⚡ Hipercargas activadas
                        </h3>

                        <p>
                            Elegí la cantidad total de
                            hipercargas activadas durante
                            todo el partido.
                        </p>

                        <div class="dev-marcadores">

                            ${crearOpcionesHipercargas(
                                numeroPartido,
                                resultadoGuardado,
                                estaCerrado
                            )}

                        </div>

                        <hr style="margin:25px 0;">

                        <h3>
                            ⭐ MVP del partido
                        </h3>

                        <p>
                            Elegí uno de los tres jugadores
                            de cada equipo.
                        </p>

                        <div class="dev-marcadores">

                            ${crearOpcionesMVP(
                                numeroPartido,
                                equipo1,
                                equipo2,
                                resultadoGuardado,
                                estaCerrado
                            )}

                        </div>
                    `
                    : ""
            }

            <p
                class="dev-estado"
                id="estado-${numeroPartido}"
            >
                ${
                    resultadoGuardado
                        ? `
                            Predicción guardada:
                            ${escaparHTML(
                                resultadoGuardado.ganador
                            )}
                            ${escaparHTML(
                                resultadoGuardado.resultado
                            )}

                            ${
                                resultadoGuardado.hipercargas
                                    ? `• ⚡ ${
                                        escaparHTML(
                                            resultadoGuardado.hipercargas
                                        )
                                    }`
                                    : ""
                            }

                            ${
                                resultadoGuardado.mvp
                                    ? `• ⭐ ${
                                        escaparHTML(
                                            resultadoGuardado.mvp
                                        )
                                    }`
                                    : ""
                            }
                        `
                        : "Sin predicción simulada"
                }
            </p>
        `;

        partidosDev.appendChild(tarjeta);
    });

    mostrarCampeon();
}

/* =========================================
   LEER PREDICCIONES
========================================= */

function leerResultadosActuales() {
    const partidos =
        obtenerPartidos(laboratorio.fase);

    const resultados = [];

    const esCuartos =
        laboratorio.fase === "cuartos";

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
                `Completa el ganador y el marcador del partido ${numeroPartido}.`
            );
        }

        const prediccion = {
            partido: numeroPartido,
            ganador,
            resultado
        };

        if (esCuartos) {
            const hipercargas =
                document.querySelector(
                    `input[name="hipercargas-${numeroPartido}"]:checked`
                )?.value;

            const mvp =
                document.querySelector(
                    `input[name="mvp-${numeroPartido}"]:checked`
                )?.value;

            if (!hipercargas) {
                throw new Error(
                    `Selecciona las hipercargas del partido ${numeroPartido}.`
                );
            }

            if (!mvp) {
                throw new Error(
                    `Selecciona el MVP del partido ${numeroPartido}.`
                );
            }

            prediccion.hipercargas =
                hipercargas;

            prediccion.mvp = mvp;
        }

        resultados.push(prediccion);
    }

    return resultados;
}

/* =========================================
   MOSTRAR CAMPEÓN
========================================= */

function mostrarCampeon() {
    const resultadoFinal =
        obtenerResultado("final", 1);

    if (!resultadoFinal?.ganador) {
        campeonDev.classList.add("dev-oculto");
        campeonDev.innerHTML = "";
        return;
    }

    campeonDev.classList.remove("dev-oculto");

    campeonDev.innerHTML = `
        <div style="font-size:45px;">
            ⭐ 🏆 ⭐
        </div>

        <h2>
            ${escaparHTML(
                resultadoFinal.ganador
            )}
        </h2>

        <h3>
            CAMPEÓN DE NOVA CLASH
        </h3>

        <p>
            Resultado de la final:
            <strong>
                ${escaparHTML(
                    resultadoFinal.resultado
                )}
            </strong>
        </p>
    `;
}

/* =========================================
   EVENTOS
========================================= */

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
            "La vista está cerrada. Cambiala a predicciones abiertas para editar."
        );

        return;
    }

    try {
        const resultados =
            leerResultadosActuales();

        laboratorio.resultados[
            laboratorio.fase
        ] = resultados;

        /*
            Si se cambian los Cuartos,
            se eliminan las Semifinales
            y la Final anteriores.
        */

        if (laboratorio.fase === "cuartos") {
            laboratorio.resultados.semifinal = [];
            laboratorio.resultados.final = [];
        }

        /*
            Si se cambian las Semifinales,
            se elimina la Final anterior.
        */

        if (laboratorio.fase === "semifinal") {
            laboratorio.resultados.final = [];
        }

        guardarLaboratorio();
        renderizarPartidos();

        alert(
            `${nombreFase(
                laboratorio.fase
            )} guardada en modo prueba.`
        );

    } catch (error) {
        console.error(
            "Error al guardar la simulación:",
            error
        );

        alert(error.message);
    }
});

reiniciarDev.addEventListener("click", () => {
    const confirmar = confirm(
        "¿Querés borrar toda la simulación?"
    );

    if (!confirmar) return;

    localStorage.removeItem(CLAVE_LOCAL);

    laboratorio = crearEstadoInicial();

    faseDev.value = "cuartos";
    estadoDev.value = "abiertas";

    renderizarPartidos();

    alert("La simulación fue borrada.");
});

/* =========================================
   INICIAR
========================================= */

renderizarPartidos();
