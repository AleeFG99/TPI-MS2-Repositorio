// Excepciones del dominio. El mensaje de cada una es el texto que se muestra al usuario.

/** Error de negocio o de datos que la interfaz puede mostrar tal cual. */
export class SolicitudError extends Error {
  constructor(mensaje, opciones) {
    super(mensaje, opciones);
    this.name = new.target.name;
  }
}

/** Un dato de entrada no cumple las reglas (campo vacío, formato, valor desconocido). */
export class ValidacionError extends SolicitudError {}

export class SolicitudNoEncontrada extends SolicitudError {
  constructor() {
    super("solicitud no encontrada");
  }
}

export class TransicionNoPermitida extends SolicitudError {
  constructor(actual, nuevo) {
    super(`transición no permitida: ${actual} -> ${nuevo}`);
  }
}

export class AsignacionNoPermitida extends SolicitudError {
  constructor(estado) {
    super(`no se puede asignar responsable a una solicitud ${estado}`);
  }
}

/** No se pudo leer o escribir el almacenamiento de datos. */
export class RepositorioError extends SolicitudError {}
