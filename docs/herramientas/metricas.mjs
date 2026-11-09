// Métricas estáticas aproximadas de los .js de una carpeta (solo Node.js, sin dependencias).
// Uso:  node docs/herramientas/metricas.mjs [directorio]      (por defecto: app)
//
// Por archivo y por función/método calcula:
//   - LOC: líneas de código (sin vacías ni comentarios),
//   - parámetros (un parámetro desestructurado { a, b } cuenta como 1),
//   - CC: complejidad ciclomática aproximada = 1 + if, for, while, case, catch, &&, ||, ??, ?: .
// Es un analizador por expresiones regulares (no un AST): sirve para comparar versiones,
// no reemplaza a una herramienta profesional como ESLint/complexity-report.
import fs from "node:fs";
import path from "node:path";

function limpiar(texto) {
  // reemplaza comentarios y contenido de strings por espacios, conservando saltos de línea
  let out = "", i = 0;
  const blanco = (s) => s.replace(/[^\n]/g, " ");
  while (i < texto.length) {
    const c = texto[i], n = texto[i + 1];
    if (c === "/" && n === "/") { const j = texto.indexOf("\n", i); const f = j < 0 ? texto.length : j; out += blanco(texto.slice(i, f)); i = f; }
    else if (c === "/" && n === "*") { const j = texto.indexOf("*/", i + 2); const f = j < 0 ? texto.length : j + 2; out += blanco(texto.slice(i, f)); i = f; }
    else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < texto.length && texto[j] !== c) { if (texto[j] === "\\") j++; j++; }
      out += c + blanco(texto.slice(i + 1, j)) + c; i = j + 1;
    } else { out += c; i++; }
  }
  return out;
}

const PALABRAS = new Set(["if", "for", "while", "switch", "catch", "function", "return", "else", "with"]);
const METODO = /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:static\s+)?(?:function\s*\*?\s*)?([#A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{\s*$/;
const FLECHA = /^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{\s*$/;

function contarParametros(texto) {
  const sin = texto.replace(/\{[^}]*\}/g, "x").replace(/\[[^\]]*\]/g, "x");
  return sin.split(",").map((p) => p.trim()).filter(Boolean).length;
}

function complejidad(texto) {
  let cc = 1;
  for (const re of [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g, /&&/g, /\|\|/g, /\?\?/g, /\?(?![.?])/g]) {
    cc += (texto.match(re) || []).length;
  }
  return cc;
}

function funciones(limpio) {
  const lineas = limpio.split("\n"), res = [];
  lineas.forEach((linea, idx) => {
    const m = linea.match(FLECHA) || linea.match(METODO);
    if (!m || PALABRAS.has(m[1])) return;
    let prof = 0, fin = idx, abierto = false;
    for (let k = idx; k < lineas.length; k++) {
      for (const ch of lineas[k]) { if (ch === "{") { prof++; abierto = true; } else if (ch === "}") prof--; }
      if (abierto && prof === 0) { fin = k; break; }
    }
    const cuerpo = lineas.slice(idx, fin + 1).join("\n");
    res.push({ nombre: m[1], loc: cuerpo.split("\n").filter((l) => l.trim()).length, params: contarParametros(m[2]), cc: complejidad(cuerpo) });
  });
  return res;
}

function archivosJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivosJs(path.join(dir, e.name)) : e.name.endsWith(".js") ? [path.join(dir, e.name)] : []).sort();
}

const dir = process.argv[2] ?? "app";
let total = 0;
const todas = [];
console.log("archivo".padEnd(28) + "LOC".padStart(6) + "funcs".padStart(7));
for (const ruta of archivosJs(dir)) {
  const limpio = limpiar(fs.readFileSync(ruta, "utf-8"));
  const loc = limpio.split("\n").filter((l) => l.trim()).length;
  const fs_ = funciones(limpio);
  total += loc;
  fs_.forEach((f) => todas.push({ archivo: path.basename(ruta), ...f }));
  console.log([path.basename(dir), path.relative(dir, ruta).split(path.sep).join("/")].join("/").padEnd(28) + String(loc).padStart(6) + String(fs_.length).padStart(7));
}
console.log("TOTAL".padEnd(28) + String(total).padStart(6) + String(todas.length).padStart(7) + "\n");
console.log("Funciones más críticas (ordenadas por complejidad):");
console.log("función".padEnd(34) + "LOC".padStart(5) + "params".padStart(8) + "CC".padStart(5));
for (const f of [...todas].sort((a, b) => b.cc - a.cc).slice(0, 6)) {
  console.log((f.archivo + ":" + f.nombre).padEnd(34) + String(f.loc).padStart(5) + String(f.params).padStart(8) + String(f.cc).padStart(5));
}
if (todas.length) {
  const max = (k) => Math.max(...todas.map((f) => f[k]));
  console.log(`\nMáx. LOC por función : ${max("loc")}`);
  console.log(`Máx. parámetros      : ${max("params")}`);
  console.log(`Máx. complejidad (CC): ${max("cc")}`);
  console.log(`CC promedio          : ${(todas.reduce((a, f) => a + f.cc, 0) / todas.length).toFixed(1)}`);
  console.log(`Funciones con CC > 10: ${todas.filter((f) => f.cc > 10).length}`);
}
