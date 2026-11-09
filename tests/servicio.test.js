import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SolicitudNoEncontrada, TransicionNoPermitida, ValidacionError } from "../app/errores.js";
import { Estado } from "../app/modelo.js";
import { RepositorioMemoria } from "../app/repositorio.js";
import { ServicioSolicitudes } from "../app/servicio.js";
import { DatosSolicitud } from "../app/validaciones.js";

const datos = (cambios = {}) => new DatosSolicitud({
  nombre: "Ana Pérez", legajo: "40111", email: "ana@ejemplo.edu", carrera: "TUP", tipo: "examen",
  prioridad: "alta", titulo: "Examen libre", descripcion: "", ...cambios,
});
const nuevoServicio = () => {
  const repo = new RepositorioMemoria();
  return { servicio: new ServicioSolicitudes(repo, () => new Date(2026, 10, 7)), repo };
};

describe("servicio", () => {
  it("registrar asigna id, estado, área y fecha, y persiste", () => {
    const { servicio, repo } = nuevoServicio();
    const s = servicio.registrar(datos());
    assert.deepEqual([s.id, s.estado, s.responsable, s.fecha], [1, Estado.PENDIENTE, "Bedelía", "2026-11-07"]);
    assert.deepEqual(repo.cargar(), [s]);
  });

  it("los ids son correlativos", () => {
    const { servicio } = nuevoServicio();
    assert.deepEqual([1, 2, 3].map(() => servicio.registrar(datos()).id), [1, 2, 3]);
  });

  it("un dato inválido no persiste nada", () => {
    const { servicio, repo } = nuevoServicio();
    assert.throws(() => servicio.registrar(datos({ legajo: "abc" })), ValidacionError);
    assert.deepEqual(repo.cargar(), []);
  });

  it("cambiarEstado devuelve anterior y nuevo", () => {
    const { servicio, repo } = nuevoServicio();
    servicio.registrar(datos());
    assert.deepEqual(servicio.cambiarEstado(1, " En_Proceso "), { anterior: Estado.PENDIENTE, nuevo: Estado.EN_PROCESO });
    assert.equal(repo.cargar()[0].estado, Estado.EN_PROCESO);
  });

  it("cambiarEstado verifica en el orden histórico: id, estado, transición", () => {
    const { servicio } = nuevoServicio();
    servicio.registrar(datos());
    assert.throws(() => servicio.cambiarEstado(99, "volando"), SolicitudNoEncontrada);
    assert.throws(() => servicio.cambiarEstado(1, "volando"), /estado inválido/);
    assert.throws(() => servicio.cambiarEstado(1, "cerrada"), TransicionNoPermitida);
  });

  it("asignarResponsable persiste", () => {
    const { servicio, repo } = nuevoServicio();
    servicio.registrar(datos());
    servicio.asignarResponsable(1, " Juan ");
    assert.equal(repo.cargar()[0].responsable, "Juan");
  });

  it("asignar a una solicitud inexistente", () => {
    assert.throws(() => nuevoServicio().servicio.asignarResponsable(1, "Juan"), SolicitudNoEncontrada);
  });

  it("el id nuevo funciona con cientos de miles de solicitudes (sin desbordar la pila)", () => {
    const repo = new RepositorioMemoria();
    const servicio = new ServicioSolicitudes(repo);
    const base = servicio.registrar(datos());
    repo.guardar(Array.from({ length: 200000 }, (_, i) => ({ ...base, id: i + 1 })));
    assert.equal(servicio.registrar(datos()).id, 200001);
  });
});
