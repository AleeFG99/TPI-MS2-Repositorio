// Casos de uso que modifican solicitudes (comandos). No imprime ni conoce el formato de archivo.
import { SolicitudNoEncontrada } from "./errores.js";
import { AREA_POR_TIPO, Estado, Solicitud, interpretar } from "./modelo.js";
import { validarRegistro } from "./validaciones.js";

export function formatearFecha(fecha) {
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function obtener(solicitudes, id) {
  const solicitud = solicitudes.find((s) => s.id === id);
  if (solicitud === undefined) {
    throw new SolicitudNoEncontrada();
  }
  return solicitud;
}

export class ServicioSolicitudes {
  #repositorio;
  #hoy;

  /** @param {import("./repositorio.js").RepositorioSolicitudes} repositorio */
  constructor(repositorio, hoy = () => new Date()) {
    this.#repositorio = repositorio;
    this.#hoy = hoy;
  }

  registrar(datos) {
    const validados = validarRegistro(datos);
    const solicitudes = this.#repositorio.cargar();
    const nueva = new Solicitud({
      id: solicitudes.reduce((maximo, s) => Math.max(maximo, s.id), 0) + 1,
      estudiante: validados.estudiante, tipo: validados.tipo, prioridad: validados.prioridad,
      titulo: validados.titulo, descripcion: validados.descripcion, estado: Estado.PENDIENTE,
      responsable: AREA_POR_TIPO.get(validados.tipo), fecha: formatearFecha(this.#hoy()),
    });
    solicitudes.push(nueva);
    this.#repositorio.guardar(solicitudes);
    return nueva;
  }

  /** Devuelve { anterior, nuevo }. El orden de chequeos es el histórico: id, estado válido, transición. */
  cambiarEstado(id, textoEstado) {
    const solicitudes = this.#repositorio.cargar();
    const solicitud = obtener(solicitudes, id);
    const nuevo = interpretar(Estado, textoEstado, "estado inválido");
    const anterior = solicitud.cambiarEstado(nuevo);
    this.#repositorio.guardar(solicitudes);
    return { anterior, nuevo };
  }

  asignarResponsable(id, nombre) {
    const solicitudes = this.#repositorio.cargar();
    const solicitud = obtener(solicitudes, id);
    solicitud.asignarResponsable(nombre);
    this.#repositorio.guardar(solicitudes);
    return solicitud;
  }
}
