// Persistencia. El resto del sistema depende de estas interfaces (documentadas con JSDoc), no del archivo JSON (DIP).
import fs from "node:fs";
import path from "node:path";
import { RepositorioError } from "./errores.js";
import { Estado, Estudiante, Prioridad, Solicitud, Tipo } from "./modelo.js";

export const RUTA_DATOS = "data/solicitudes.json";

/**
 * Interfaz mínima de lectura (ISP): lo único que necesitan las consultas.
 * @typedef {{ cargar(): Solicitud[] }} LectorSolicitudes
 *
 * Lectura + escritura, para quien modifica solicitudes.
 * @typedef {{ cargar(): Solicitud[], guardar(solicitudes: Solicitud[]): void }} RepositorioSolicitudes
 */

/** Implementación en memoria: sustituible por la de archivo (LSP) y útil para pruebas. */
export class RepositorioMemoria {
  #solicitudes;

  constructor(solicitudes = []) {
    this.#solicitudes = [...solicitudes];
  }

  cargar() {
    return [...this.#solicitudes];
  }

  guardar(solicitudes) {
    this.#solicitudes = [...solicitudes];
  }
}

function aObjeto(s) {
  return {
    id: s.id, nombre: s.estudiante.nombre, legajo: s.estudiante.legajo, email: s.estudiante.email,
    carrera: s.estudiante.carrera, tipo: s.tipo, prioridad: s.prioridad, titulo: s.titulo,
    descripcion: s.descripcion, estado: s.estado, responsable: s.responsable, fecha: s.fecha,
  };
}

const CAMPOS_TEXTO = ["nombre", "legajo", "email", "carrera", "titulo", "descripcion", "responsable", "fecha"];

/** Verifica la forma de un registro leído del archivo: evita cargar datos a medias o con valores desconocidos. */
function verificarRegistro(d) {
  const valido = typeof d === "object" && d !== null && Number.isInteger(d.id)
    && CAMPOS_TEXTO.every((campo) => typeof d[campo] === "string")
    && Object.values(Tipo).includes(d.tipo) && Object.values(Prioridad).includes(d.prioridad)
    && Object.values(Estado).includes(d.estado);
  if (!valido) {
    throw new TypeError("registro con formato inválido");
  }
}

function desdeObjeto(d) {
  verificarRegistro(d);
  return new Solicitud({
    id: d.id, estudiante: new Estudiante(d.nombre, d.legajo, d.email, d.carrera), tipo: d.tipo,
    prioridad: d.prioridad, titulo: d.titulo, descripcion: d.descripcion, estado: d.estado,
    responsable: d.responsable, fecha: d.fecha,
  });
}

/** Guarda las solicitudes en un archivo JSON (mismo formato que la versión base). */
export class RepositorioJson {
  #ruta;

  constructor(ruta = RUTA_DATOS) {
    this.#ruta = ruta;
  }

  cargar() {
    if (!fs.existsSync(this.#ruta)) {
      return [];
    }
    try {
      const datos = JSON.parse(fs.readFileSync(this.#ruta, "utf-8"));
      if (!Array.isArray(datos)) {
        throw new TypeError("se esperaba una lista de solicitudes");
      }
      return datos.map(desdeObjeto);
    } catch (causa) {
      if (causa instanceof SyntaxError || causa instanceof TypeError) {
        throw new RepositorioError(
          `no se pudo leer el archivo de datos (${this.#ruta}): está dañado o tiene un formato inválido; no se modificó`,
          { cause: causa });
      }
      throw new RepositorioError(`no se pudo leer el archivo de datos (${this.#ruta})`, { cause: causa });
    }
  }

  guardar(solicitudes) {
    try {
      fs.mkdirSync(path.dirname(this.#ruta), { recursive: true });
      const temporal = `${this.#ruta}.tmp`;
      fs.writeFileSync(temporal, JSON.stringify(solicitudes.map(aObjeto), null, 2), "utf-8");
      fs.renameSync(temporal, this.#ruta); // reemplazo atómico: un corte no deja el JSON a medias
    } catch (causa) {
      throw new RepositorioError(`no se pudo guardar el archivo de datos (${this.#ruta})`, { cause: causa });
    }
  }
}
