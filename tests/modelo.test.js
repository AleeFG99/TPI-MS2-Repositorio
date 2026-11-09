import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AsignacionNoPermitida, TransicionNoPermitida, ValidacionError } from "../app/errores.js";
import { AREA_POR_TIPO, Estado, Estudiante, Prioridad, Solicitud, TRANSICIONES, Tipo, interpretar } from "../app/modelo.js";

const unaSolicitud = (estado = Estado.PENDIENTE, prioridad = Prioridad.ALTA) => new Solicitud({
  id: 1, estudiante: new Estudiante("Ana Pérez", "40111", "ana@ejemplo.edu", "TUP"), tipo: Tipo.CERTIFICADO,
  prioridad, titulo: "Certificado", descripcion: "", estado, responsable: "Alumnos", fecha: "2026-10-01",
});

describe("modelo", () => {
  it("todo tipo tiene área y todo estado tiene transiciones", () => {
    assert.deepEqual([...AREA_POR_TIPO.keys()].sort(), Object.values(Tipo).sort());
    assert.deepEqual([...TRANSICIONES.keys()].sort(), Object.values(Estado).sort());
  });

  const permitidas = [
    [Estado.PENDIENTE, Estado.EN_PROCESO], [Estado.PENDIENTE, Estado.RECHAZADA],
    [Estado.EN_PROCESO, Estado.RESUELTA], [Estado.EN_PROCESO, Estado.RECHAZADA],
    [Estado.RESUELTA, Estado.CERRADA], [Estado.RESUELTA, Estado.EN_PROCESO],
  ];
  for (const [desde, hasta] of permitidas) {
    it(`transición permitida ${desde} -> ${hasta}`, () => {
      const s = unaSolicitud(desde);
      assert.equal(s.cambiarEstado(hasta), desde);
      assert.equal(s.estado, hasta);
    });
  }

  const prohibidas = [
    [Estado.PENDIENTE, Estado.RESUELTA], [Estado.PENDIENTE, Estado.PENDIENTE],
    [Estado.CERRADA, Estado.EN_PROCESO], [Estado.RECHAZADA, Estado.PENDIENTE],
  ];
  for (const [desde, hasta] of prohibidas) {
    it(`transición prohibida ${desde} -> ${hasta} no modifica el estado`, () => {
      const s = unaSolicitud(desde);
      assert.throws(() => s.cambiarEstado(hasta), (e) => e instanceof TransicionNoPermitida && e.message.includes(`${desde} -> ${hasta}`));
      assert.equal(s.estado, desde);
    });
  }

  it("asignar responsable recorta espacios", () => {
    const s = unaSolicitud();
    s.asignarResponsable("  Juan Pérez ");
    assert.equal(s.responsable, "Juan Pérez");
  });

  it("asignar responsable vacío se rechaza", () => {
    assert.throws(() => unaSolicitud().asignarResponsable("   "), (e) => e instanceof ValidacionError && /no puede estar vacío/.test(e.message));
  });

  for (const estado of [Estado.CERRADA, Estado.RECHAZADA]) {
    it(`no se asigna responsable en estado ${estado}`, () => {
      assert.throws(() => unaSolicitud(estado).asignarResponsable("Juan"), (e) => e instanceof AsignacionNoPermitida && e.message.includes(estado));
    });
  }

  it("urgente abierta: solo prioridad alta y estado abierto", () => {
    assert.ok(unaSolicitud(Estado.PENDIENTE, Prioridad.ALTA).esUrgenteAbierta());
    assert.ok(unaSolicitud(Estado.EN_PROCESO, Prioridad.ALTA).esUrgenteAbierta());
    assert.ok(!unaSolicitud(Estado.RESUELTA, Prioridad.ALTA).esUrgenteAbierta());
    assert.ok(!unaSolicitud(Estado.PENDIENTE, Prioridad.MEDIA).esUrgenteAbierta());
  });

  it("el resumen tiene el formato histórico", () => {
    assert.equal(unaSolicitud().resumen(), "#1 | certificado | alta | pendiente | Alumnos | Certificado (Ana Pérez, legajo 40111)");
  });

  it("interpretar ignora espacios y mayúsculas y rechaza valores desconocidos", () => {
    assert.equal(interpretar(Tipo, "  BECA ", "tipo inválido"), Tipo.BECA);
    assert.throws(() => interpretar(Tipo, "otra", "tipo inválido"), /tipo inválido/);
    assert.throws(() => interpretar(Tipo, "constructor", "tipo inválido"), /tipo inválido/);
  });
});
