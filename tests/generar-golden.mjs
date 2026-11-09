// Registra la salida y los datos de cada escenario en tests/golden/.
// Se ejecutó UNA vez sobre el tag `estado-inicial` (versión base) para fijar el comportamiento
// externo esperado. Volver a ejecutarlo solo si el comportamiento esperado cambia a propósito.
//   node tests/generar-golden.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ESCENARIOS } from "./escenarios.js";
import { ejecutarEscenario } from "./helpers.js";

const GOLDEN = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "golden");
fs.mkdirSync(GOLDEN, { recursive: true });
for (const [nombre, escenario] of Object.entries(ESCENARIOS)) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "golden-"));
  const { salida, datos } = ejecutarEscenario(escenario, tmp);
  fs.writeFileSync(path.join(GOLDEN, `${nombre}.out`), salida, "utf-8");
  fs.writeFileSync(path.join(GOLDEN, `${nombre}.json`), datos, "utf-8");
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("golden:", nombre);
}
