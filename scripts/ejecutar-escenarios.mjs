// Ejecuta los escenarios de caja negra contra la app que está en <raiz-app> y guarda
// la salida en <carpeta-salida>/<escenario>.out y .json. Lo usa comparar-versiones.
//   node scripts/ejecutar-escenarios.mjs <raiz-app> <carpeta-salida>
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ESCENARIOS } from "../tests/escenarios.js";
import { ejecutarEscenario } from "../tests/helpers.js";

const [raizApp, salida] = process.argv.slice(2);
if (!raizApp || !salida) {
  console.error("uso: node scripts/ejecutar-escenarios.mjs <raiz-app> <carpeta-salida>");
  process.exit(2);
}
fs.mkdirSync(salida, { recursive: true });
for (const [nombre, escenario] of Object.entries(ESCENARIOS)) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-"));
  const resultado = ejecutarEscenario(escenario, tmp, path.resolve(raizApp));
  fs.writeFileSync(path.join(salida, `${nombre}.out`), resultado.salida, "utf-8");
  fs.writeFileSync(path.join(salida, `${nombre}.json`), resultado.datos, "utf-8");
  fs.rmSync(tmp, { recursive: true, force: true });
}
