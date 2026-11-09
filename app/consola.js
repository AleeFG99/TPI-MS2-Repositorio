// Interfaz de consola. Solo lee, imprime y delega; entrada y salida son inyectables.
import { SolicitudError } from "./errores.js";
import { DatosSolicitud } from "./validaciones.js";

const MENU = [
  "",
  "=== Gestión de Solicitudes Académicas ===",
  "1. Registrar solicitud",
  "2. Cambiar estado",
  "3. Asignar responsable",
  "4. Buscar / filtrar solicitudes",
  "5. Reporte",
  "0. Salir",
];

export class ConsolaCLI {
  #servicio;
  #consultas;
  #entrada;
  #salida;
  #acciones;

  /** @param {{ servicio, consultas, entrada: (prompt: string) => Promise<string>, salida: (linea: string) => void }} dependencias */
  constructor({ servicio, consultas, entrada, salida = console.log }) {
    this.#servicio = servicio;
    this.#consultas = consultas;
    this.#entrada = entrada;
    this.#salida = salida;
    this.#acciones = new Map([
      ["1", () => this.#registrar()], ["2", () => this.#cambiarEstado()], ["3", () => this.#asignarResponsable()],
      ["4", () => this.#buscar()], ["5", () => this.#reporte()],
    ]);
  }

  async ejecutar() {
    while (true) {
      MENU.forEach((linea) => this.#salida(linea));
      const opcion = await this.#entrada("Opción: ");
      if (opcion === "0") {
        this.#salida("Hasta luego");
        return;
      }
      const accion = this.#acciones.get(opcion);
      if (accion === undefined) {
        this.#salida("Opción inválida");
        continue;
      }
      try {
        await accion();
      } catch (error) {
        if (!(error instanceof SolicitudError)) {
          throw error;
        }
        this.#salida(`Error: ${error.message}`);
      }
    }
  }

  async #pedirId() {
    const texto = await this.#entrada("ID de la solicitud: ");
    if (!/^[0-9]+$/.test(texto.trim())) {
      this.#salida("Error: ID inválido");
      return null;
    }
    return Number.parseInt(texto, 10);
  }

  async #registrar() {
    const datos = new DatosSolicitud({
      nombre: await this.#entrada("Nombre del estudiante: "),
      legajo: await this.#entrada("Legajo: "),
      email: await this.#entrada("Email: "),
      carrera: await this.#entrada("Carrera: "),
      tipo: await this.#entrada("Tipo (certificado/equivalencia/examen/beca/otro): "),
      prioridad: await this.#entrada("Prioridad (alta/media/baja): "),
      titulo: await this.#entrada("Título: "),
      descripcion: await this.#entrada("Descripción: "),
    });
    const solicitud = this.#servicio.registrar(datos);
    this.#salida(`Solicitud #${solicitud.id} registrada. Responsable asignado: ${solicitud.responsable}`);
  }

  async #cambiarEstado() {
    const id = await this.#pedirId();
    if (id === null) {
      return;
    }
    const texto = await this.#entrada("Nuevo estado (pendiente/en_proceso/resuelta/cerrada/rechazada): ");
    const { anterior, nuevo } = this.#servicio.cambiarEstado(id, texto);
    this.#salida(`Estado de la solicitud #${id} actualizado: ${anterior} -> ${nuevo}`);
  }

  async #asignarResponsable() {
    const id = await this.#pedirId();
    if (id === null) {
      return;
    }
    const nombre = await this.#entrada("Nuevo responsable: ");
    const solicitud = this.#servicio.asignarResponsable(id, nombre);
    this.#salida(`Responsable de la solicitud #${id}: ${solicitud.responsable}`);
  }

  async #buscar() {
    const criterio = await this.#entrada("Filtrar por (1) estado (2) tipo (3) prioridad (4) texto: ");
    const valor = await this.#entrada("Valor: ");
    const resultados = this.#consultas.buscar(criterio, valor);
    resultados.forEach((s) => this.#salida(s.resumen()));
    if (resultados.length === 0) {
      this.#salida("No se encontraron solicitudes");
    }
  }

  #reporte() {
    const r = this.#consultas.reporte();
    this.#salida("--- REPORTE DE SOLICITUDES ---");
    this.#salida(`Total: ${r.total}`);
    this.#bloque("Por estado:", r.porEstado);
    this.#bloque("Por tipo:", r.porTipo);
    this.#bloque("Por prioridad:", r.porPrioridad);
    this.#salida("Urgentes abiertas:");
    r.urgentes.forEach((s) => this.#salida(`  #${s.id} ${s.titulo} -> ${s.responsable}`));
    if (r.urgentes.length === 0) {
      this.#salida("  (ninguna)");
    }
  }

  #bloque(titulo, conteos) {
    this.#salida(titulo);
    for (const [valor, cantidad] of conteos) {
      this.#salida(`  ${valor}: ${cantidad}`);
    }
  }
}
