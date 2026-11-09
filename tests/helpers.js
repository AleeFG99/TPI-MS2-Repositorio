// Ejecuta el sistema como caja negra (node app/main.js) en un directorio temporal.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FECHA = /\d{4}-\d{2}-\d{2}/g;

// La fecha de alta es la de hoy: se reemplaza para poder comparar contra el golden master.
export const normalizar = (texto) => texto.replace(FECHA, "<FECHA>");

/** raizApp: carpeta que contiene app/main.js (permite probar otra versión, p. ej. un tag). */
export function ejecutarEscenario(escenario, directorio, raizApp = RAIZ) {
  fs.mkdirSync(path.join(directorio, "data"), { recursive: true });
  if (escenario.precarga) {
    fs.copyFileSync(path.join(RAIZ, "data", "solicitudes.ejemplo.json"), path.join(directorio, "data", "solicitudes.json"));
  }
  const salidas = [];
  escenario.sesiones.forEach((lineas, i) => {
    const proceso = spawnSync(process.execPath, [path.join(raizApp, "app", "main.js")], {
      cwd: directorio, input: lineas.join("\n") + "\n", encoding: "utf-8", timeout: 30000,
    });
    if (proceso.status !== 0) throw new Error(`sesión ${i + 1} terminó con código ${proceso.status}: ${proceso.stderr}`);
    salidas.push(`##### SESION ${i + 1} #####\n${proceso.stdout}`);
  });
  const archivo = path.join(directorio, "data", "solicitudes.json");
  const datos = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, "utf-8")) : null;
  return {
    salida: normalizar(salidas.join("")),
    datos: datos === null ? "SIN ARCHIVO" : normalizar(JSON.stringify(datos, null, 2)),
  };
}
