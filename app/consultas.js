// Casos de uso de solo lectura: búsqueda/filtrado y reporte. Dependen únicamente de LectorSolicitudes.
import { ValidacionError } from "./errores.js";
import { Estado, Prioridad, Tipo } from "./modelo.js";

export const Criterio = Object.freeze({ ESTADO: "1", TIPO: "2", PRIORIDAD: "3", TEXTO: "4" });

// Un criterio nuevo se agrega con una fila nueva (OCP).
const FILTROS = new Map([
  [Criterio.ESTADO, (s, v) => s.estado === v],
  [Criterio.TIPO, (s, v) => s.tipo === v],
  [Criterio.PRIORIDAD, (s, v) => s.prioridad === v],
  [Criterio.TEXTO, (s, v) => s.estudiante.nombre.toLowerCase().includes(v)
    || s.titulo.toLowerCase().includes(v) || s.estudiante.legajo.includes(v)],
]);

/** Cuenta ocurrencias de cada valor de la enumeración, incluso las que no aparecen (0). */
function contar(enumeracion, valores) {
  const conteo = new Map(Object.values(enumeracion).map((v) => [v, 0]));
  for (const v of valores) {
    conteo.set(v, conteo.get(v) + 1);
  }
  return conteo;
}

export class ConsultasSolicitudes {
  #lector;

  /** @param {import("./repositorio.js").LectorSolicitudes} lector */
  constructor(lector) {
    this.#lector = lector;
  }

  buscar(criterio, valor) {
    const filtro = FILTROS.get(criterio.trim());
    if (filtro === undefined) {
      throw new ValidacionError("criterio inválido");
    }
    const buscado = valor.trim().toLowerCase();
    return this.#lector.cargar().filter((s) => filtro(s, buscado));
  }

  reporte() {
    const solicitudes = this.#lector.cargar();
    return {
      total: solicitudes.length,
      porEstado: contar(Estado, solicitudes.map((s) => s.estado)),
      porTipo: contar(Tipo, solicitudes.map((s) => s.tipo)),
      porPrioridad: contar(Prioridad, solicitudes.map((s) => s.prioridad)),
      urgentes: solicitudes.filter((s) => s.esUrgenteAbierta()),
    };
  }
}
