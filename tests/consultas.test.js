import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ConsultasSolicitudes } from "../app/consultas.js";
import { ValidacionError } from "../app/errores.js";
import { Estado, Prioridad, Tipo } from "../app/modelo.js";
import { RepositorioMemoria } from "../app/repositorio.js";
import { ServicioSolicitudes } from "../app/servicio.js";
import { DatosSolicitud } from "../app/validaciones.js";

function escenario() {
  const repo = new RepositorioMemoria();
  const servicio = new ServicioSolicitudes(repo);
  const base = { email: "x@ejemplo.edu", carrera: "TUP", descripcion: "" };
  servicio.registrar(new DatosSolicitud({ nombre: "Ana Pérez", legajo: "111", tipo: "beca", prioridad: "alta", titulo: "Beca de transporte", ...base }));
  servicio.registrar(new DatosSolicitud({ nombre: "Luis Soto", legajo: "222", tipo: "examen", prioridad: "baja", titulo: "Examen libre", ...base }));
  servicio.cambiarEstado(2, "en_proceso");
  return new ConsultasSolicitudes(repo);
}

describe("consultas", () => {
  const casos = [
    ["1", "pendiente", [1]], ["1", " EN_PROCESO ", [2]], ["2", "beca", [1]], ["3", "baja", [2]],
    ["4", "ANA", [1]], ["4", "222", [2]], ["4", "libre", [2]], ["4", "zzz", []], [" 4 ", "a", [1, 2]],
  ];
  for (const [criterio, valor, ids] of casos) {
    it(`buscar criterio ${JSON.stringify(criterio)} valor ${JSON.stringify(valor)}`, () => {
      assert.deepEqual(escenario().buscar(criterio, valor).map((s) => s.id), ids);
    });
  }

  for (const criterio of ["9", "constructor", ""]) {
    it(`criterio inválido ${JSON.stringify(criterio)}`, () => {
      assert.throws(() => escenario().buscar(criterio, "x"), (e) => e instanceof ValidacionError && /criterio inválido/.test(e.message));
    });
  }

  it("el reporte cuenta todos los valores, incluso los vacíos", () => {
    const r = escenario().reporte();
    assert.equal(r.total, 2);
    assert.deepEqual([...r.porEstado.keys()], Object.values(Estado));
    assert.equal(r.porEstado.get(Estado.PENDIENTE), 1);
    assert.equal(r.porEstado.get(Estado.CERRADA), 0);
    assert.equal(r.porTipo.get(Tipo.BECA), 1);
    assert.equal(r.porTipo.get(Tipo.OTRO), 0);
    assert.equal(r.porPrioridad.get(Prioridad.ALTA), 1);
    assert.deepEqual(r.urgentes.map((s) => s.id), [1]);
  });

  it("el reporte sobre un repositorio vacío", () => {
    const r = new ConsultasSolicitudes(new RepositorioMemoria()).reporte();
    assert.equal(r.total, 0);
    assert.deepEqual(r.urgentes, []);
  });
});
