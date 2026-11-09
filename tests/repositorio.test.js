// Pruebas de contrato: RepositorioMemoria y RepositorioJson deben ser intercambiables (LSP).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { RepositorioError } from "../app/errores.js";
import { Estado, Estudiante, Prioridad, Solicitud, Tipo } from "../app/modelo.js";
import { RepositorioJson, RepositorioMemoria } from "../app/repositorio.js";

const solicitud = (id = 1) => new Solicitud({
  id, estudiante: new Estudiante("Lucía Fernández", "40125", "lu@ejemplo.edu", "TUP"), tipo: Tipo.BECA,
  prioridad: Prioridad.BAJA, titulo: "Beca", descripcion: "con tildes: ñ á", estado: Estado.PENDIENTE,
  responsable: "Bienestar Estudiantil", fecha: "2026-10-01",
});
const carpetaTemporal = () => fs.mkdtempSync(path.join(os.tmpdir(), "repo-"));
const fabricas = (dir) => [new RepositorioMemoria(), new RepositorioJson(path.join(dir, "data", "solicitudes.json"))];

describe("repositorios", () => {
  it("un repositorio nuevo está vacío", () => {
    for (const repo of fabricas(carpetaTemporal())) assert.deepEqual(repo.cargar(), []);
  });

  it("guardar y cargar conserva las solicitudes", () => {
    for (const repo of fabricas(carpetaTemporal())) {
      repo.guardar([solicitud(1), solicitud(2)]);
      assert.deepEqual(repo.cargar(), [solicitud(1), solicitud(2)]);
    }
  });

  it("cargar devuelve una copia", () => {
    for (const repo of fabricas(carpetaTemporal())) {
      repo.guardar([solicitud()]);
      repo.cargar().length = 0;
      assert.equal(repo.cargar().length, 1);
    }
  });

  it("el JSON crea la carpeta y usa el formato histórico (sin escapes unicode)", () => {
    const ruta = path.join(carpetaTemporal(), "nueva", "solicitudes.json");
    new RepositorioJson(ruta).guardar([solicitud()]);
    const texto = fs.readFileSync(ruta, "utf-8");
    assert.ok(texto.includes('"responsable": "Bienestar Estudiantil"') && texto.includes("ñ á"));
  });

  it("un JSON dañado lanza RepositorioError y no se modifica", () => {
    const ruta = path.join(carpetaTemporal(), "solicitudes.json");
    fs.writeFileSync(ruta, "{esto no es json");
    assert.throws(() => new RepositorioJson(ruta).cargar(), (e) => e instanceof RepositorioError && /no se modificó/.test(e.message));
    assert.equal(fs.readFileSync(ruta, "utf-8"), "{esto no es json");
  });

  it("guarda de forma atómica sin dejar archivos temporales", () => {
    const dir = carpetaTemporal();
    const repo = new RepositorioJson(path.join(dir, "solicitudes.json"));
    repo.guardar([solicitud(1)]);
    repo.guardar([solicitud(1), solicitud(2)]);
    assert.deepEqual(fs.readdirSync(dir), ["solicitudes.json"]);
    assert.equal(repo.cargar().length, 2);
  });

  const formatosInvalidos = {
    "un objeto en lugar de una lista": "{}",
    "un registro sin campos": '[{"id": 1}]',
    "un tipo desconocido": JSON.stringify([{ ...JSON.parse(JSON.stringify({ id: 1, nombre: "A", legajo: "1", email: "a@b.c", carrera: "T", tipo: "raro", prioridad: "alta", titulo: "t", descripcion: "", estado: "pendiente", responsable: "R", fecha: "2026-01-01" })) }]),
    "un id que no es entero": '[{"id": "1"}]',
  };
  for (const [nombre, contenido] of Object.entries(formatosInvalidos)) {
    it(`un JSON con ${nombre} se informa como dañado y no se modifica`, () => {
      const ruta = path.join(carpetaTemporal(), "solicitudes.json");
      fs.writeFileSync(ruta, contenido);
      assert.throws(() => new RepositorioJson(ruta).cargar(), RepositorioError);
      assert.equal(fs.readFileSync(ruta, "utf-8"), contenido);
    });
  }
});
