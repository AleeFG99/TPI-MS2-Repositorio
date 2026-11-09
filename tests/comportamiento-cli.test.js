// Pruebas de caracterización (golden master) del comportamiento externo.
// Ejecutan el sistema completo por consola y comparan la salida y el archivo de datos con lo
// registrado sobre la versión base (`estado-inicial`). Son la red de seguridad del refactoring:
// deben pasar igual ANTES y DESPUÉS de cada cambio.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { ESCENARIOS } from "./escenarios.js";
import { ejecutarEscenario } from "./helpers.js";

const GOLDEN = path.join(path.dirname(fileURLToPath(import.meta.url)), "golden");

describe("el comportamiento externo no cambia", () => {
  for (const [nombre, escenario] of Object.entries(ESCENARIOS)) {
    it(nombre, () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "esc-"));
      try {
        const { salida, datos } = ejecutarEscenario(escenario, tmp);
        assert.equal(salida, fs.readFileSync(path.join(GOLDEN, `${nombre}.out`), "utf-8"));
        assert.equal(datos, fs.readFileSync(path.join(GOLDEN, `${nombre}.json`), "utf-8"));
      } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
      }
    });
  }
});
