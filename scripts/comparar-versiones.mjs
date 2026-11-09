// Compara el sistema base (tag estado-inicial) con el refactorizado (tag estado-refactorizado):
//   1) ejecuta los mismos escenarios de caja negra sobre cada versión y compara salida y datos;
//   2) muestra las métricas de ambas versiones.
// Uso:  npm run comparar   |   node scripts/comparar-versiones.mjs [tagA] [tagB]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [tagA = "estado-inicial", tagB = "estado-refactorizado"] = process.argv.slice(2);
const git = (...args) => execFileSync("git", args, { cwd: raiz, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
const nodo = (...args) => execFileSync(process.execPath, args, { cwd: raiz, encoding: "utf-8" });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "comparar-"));
const trees = { [tagA]: path.join(tmp, "a"), [tagB]: path.join(tmp, "b") };
try {
  for (const [tag, dir] of Object.entries(trees)) {
    git("worktree", "add", "--detach", dir, tag);
    nodo("scripts/ejecutar-escenarios.mjs", dir, path.join(tmp, `salida-${tag}`));
  }
  const nombres = fs.readdirSync(path.join(tmp, `salida-${tagA}`)).sort();
  let distintos = 0;
  for (const n of nombres) {
    const a = fs.readFileSync(path.join(tmp, `salida-${tagA}`, n), "utf-8");
    const b = fs.readFileSync(path.join(tmp, `salida-${tagB}`, n), "utf-8");
    if (a !== b) { distintos++; console.log(`DIFERENTE: ${n}`); }
  }
  const total = nombres.length / 2;
  console.log(`\nComportamiento externo: ${total} escenarios, ${distintos === 0 ? "todos idénticos" : `${distintos} archivo(s) distintos`} entre ${tagA} y ${tagB}.\n`);
  for (const [tag, dir] of Object.entries(trees)) {
    console.log(`=== Métricas de ${tag} ===`);
    console.log(nodo("docs/herramientas/metricas.mjs", path.join(dir, "app")));
  }
  process.exitCode = distintos === 0 ? 0 : 1;
} finally {
  for (const dir of Object.values(trees)) { try { git("worktree", "remove", "--force", dir); } catch { /* ya no existe */ } }
  fs.rmSync(tmp, { recursive: true, force: true });
}
