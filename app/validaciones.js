// Validación de los datos de entrada al registrar una solicitud.
import { ValidacionError } from "./errores.js";
import { Estudiante, Prioridad, Tipo, interpretar } from "./modelo.js";

export const MAX_LARGO_TITULO = 80;

/** Parameter Object: los datos crudos que ingresa el usuario (todavía sin validar). */
export class DatosSolicitud {
  constructor({ nombre, legajo, email, carrera, tipo, prioridad, titulo, descripcion = "" }) {
    Object.assign(this, { nombre, legajo, email, carrera, tipo, prioridad, titulo, descripcion });
    Object.freeze(this);
  }
}

function noVacio(valor, mensaje) {
  valor = valor.trim();
  if (valor === "") {
    throw new ValidacionError(mensaje);
  }
  return valor;
}

function legajo(valor) {
  valor = valor.trim();
  if (!/^[0-9]+$/.test(valor)) {
    throw new ValidacionError("el legajo debe ser numérico");
  }
  return valor;
}

function email(valor) {
  valor = valor.trim();
  if (!valor.includes("@") || !valor.includes(".")) {
    throw new ValidacionError("email inválido");
  }
  return valor;
}

function titulo(valor) {
  valor = noVacio(valor, "el título no puede estar vacío");
  if (valor.length > MAX_LARGO_TITULO) {
    throw new ValidacionError(`el título no puede superar los ${MAX_LARGO_TITULO} caracteres`);
  }
  return valor;
}

/** Aplica las reglas en el orden histórico del sistema y devuelve datos limpios y tipados. */
export function validarRegistro(datos) {
  const nombre = noVacio(datos.nombre, "el nombre no puede estar vacío");
  const legajoValido = legajo(datos.legajo);
  const emailValido = email(datos.email);
  const carrera = noVacio(datos.carrera, "la carrera no puede estar vacía");
  const tipo = interpretar(Tipo, datos.tipo, "tipo inválido");
  const prioridad = interpretar(Prioridad, datos.prioridad, "prioridad inválida");
  return {
    estudiante: new Estudiante(nombre, legajoValido, emailValido, carrera),
    tipo,
    prioridad,
    titulo: titulo(datos.titulo),
    descripcion: datos.descripcion.trim(),
  };
}
