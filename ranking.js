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
   C
