// Mejora deliberada de manejo de errores: la versión base descartaba en silencio un archivo dañado
// y el siguiente guardado PERDÍA todos los datos. Ahora se informa y el archivo no se toca.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { main } from "../app/main.js";

const carpeta = () => fs.mkdtempSync(path.join(os.tmpdir(), "danado-"));

describe("archivo de datos", () => {
  it("dañado: se informa y no se sobrescribe", async () => {
    const ruta = path.join(carpeta(), "solicitudes.json");
    fs.writeFileSync(ruta, "[{ roto");
    const salidas = [];
    const codigo = await main({ entrada: async () => "0", salida: (l) => salidas.push(l), ruta });
    assert.equal(codigo, 1);
    assert.ok(salidas[0].startsWith("Error: no se pudo leer el archivo de datos"));
    assert.equal(fs.readFileSync(ruta, "utf-8"), "[{ roto");
  });

  it("inexistente: arranca vacío y sale con código 0", async () => {
    const salidas = [];
    const codigo = await main({ entrada: async () => "0", salida: (l) => salidas.push(l), ruta: path.join(carpeta(), "d", "s.json") });
    assert.equal(codigo, 0);
    assert.equal(salidas.at(-1), "Hasta luego");
  });
});
