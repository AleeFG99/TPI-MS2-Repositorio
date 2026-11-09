// Modelo de dominio: entidades, enumeraciones y reglas de negocio de una solicitud.
import { AsignacionNoPermitida, TransicionNoPermitida, ValidacionError } from "./errores.js";

export const Tipo = Object.freeze({
  CERTIFICADO: "certificado", EQUIVALENCIA: "equivalencia", EXAMEN: "examen", BECA: "beca", OTRO: "otro",
});
export const Prioridad = Object.freeze({ ALTA: "alta", MEDIA: "media", BAJA: "baja" });
export const Estado = Object.freeze({
  PENDIENTE: "pendiente", EN_PROCESO: "en_proceso", RESUELTA: "resuelta", CERRADA: "cerrada", RECHAZADA: "rechazada",
});

// Tablas de reglas: agregar un tipo o una transición es agregar una fila (OCP), no editar if/else.
export const AREA_POR_TIPO = new Map([
  [Tipo.CERTIFICADO, "Alumnos"],
  [Tipo.EQUIVALENCIA, "Secretaría Académica"],
  [Tipo.EXAMEN, "Bedelía"],
  [Tipo.BECA, "Bienestar Estudiantil"],
  [Tipo.OTRO, "Mesa de Entradas"],
]);
export const TRANSICIONES = new Map([
  [Estado.PENDIENTE, new Set([Estado.EN_PROCESO, Estado.RECHAZADA])],
  [Estado.EN_PROCESO, new Set([Estado.RESUELTA, Estado.RECHAZADA])],
  [Estado.RESUELTA, new Set([Estado.CERRADA, Estado.EN_PROCESO])],
  [Estado.CERRADA, new Set()],
  [Estado.RECHAZADA, new Set()],
]);
const ESTADOS_ABIERTOS_URGENTES = new Set([Estado.PENDIENTE, Estado.EN_PROCESO]);
const ESTADOS_SIN_REASIGNACION = new Set([Estado.CERRADA, Estado.RECHAZADA]);

/** Convierte texto del usuario (sin importar espacios/mayúsculas) en un valor de la enumeración. */
export function interpretar(enumeracion, texto, mensajeError) {
  const valor = texto.trim().toLowerCase();
  if (!Object.values(enumeracion).includes(valor)) {
    throw new ValidacionError(mensajeError);
  }
  return valor;
}

export class Estudiante {
  constructor(nombre, legajo, email, carrera) {
    this.nombre = nombre;
    this.legajo = legajo;
    this.email = email;
    this.carrera = carrera;
    Object.freeze(this);
  }
}

export class Solicitud {
  constructor({ id, estudiante, tipo, prioridad, titulo, descripcion, estado, responsable, fecha }) {
    this.id = id;
    this.estudiante = estudiante;
    this.tipo = tipo;
    this.prioridad = prioridad;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.estado = estado;
    this.responsable = responsable;
    this.fecha = fecha;
  }

  resumen() {
    const e = this.estudiante;
    return `#${this.id} | ${this.tipo} | ${this.prioridad} | ${this.estado} | `
      + `${this.responsable} | ${this.titulo} (${e.nombre}, legajo ${e.legajo})`;
  }

  esUrgenteAbierta() {
    return this.prioridad === Prioridad.ALTA && ESTADOS_ABIERTOS_URGENTES.has(this.estado);
  }

  puedePasarA(nuevo) {
    return TRANSICIONES.get(this.estado).has(nuevo);
  }

  /** Devuelve el estado anterior. */
  cambiarEstado(nuevo) {
    if (!this.puedePasarA(nuevo)) {
      throw new TransicionNoPermitida(this.estado, nuevo);
    }
    const anterior = this.estado;
    this.estado = nuevo;
    return anterior;
  }

  asignarResponsable(nombre) {
    nombre = nombre.trim();
    if (nombre === "") {
      throw new ValidacionError("el responsable no puede estar vacío");
    }
    if (ESTADOS_SIN_REASIGNACION.has(this.estado)) {
      throw new AsignacionNoPermitida(this.estado);
    }
    this.responsable = nombre;
  }
}
