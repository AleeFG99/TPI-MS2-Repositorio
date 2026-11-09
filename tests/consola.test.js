// La consola se prueba sin archivos ni subprocesos gracias a la inyección de entrada/salida (DIP).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ConsolaCLI } from "../app/consola.js";
import { ConsultasSolicitudes } from "../app/consultas.js";
import { RepositorioMemoria } from "../app/repositorio.js";
import { ServicioSolicitudes } from "../app/servicio.js";

async function correr(lineas) {
  const repo = new RepositorioMemoria();
  const pendientes = [...lineas];
  const salidas = [];
  const consola = new ConsolaCLI({
    servicio: new ServicioSolicitudes(repo), consultas: new ConsultasSolicitudes(repo),
    entrada: async () => pendientes.shift(), salida: (l) => salidas.push(l),
  });
  await consola.ejecutar();
  return salidas;
}

describe("consola", () => {
  it("salir directamente", async () => {
    assert.equal((await correr(["0"])).at(-1), "Hasta luego");
  });

  it("una opción inválida vuelve al menú", async () => {
    const salidas = await correr(["x", "0"]);
    assert.ok(salidas.includes("Opción inválida"));
    assert.equal(salidas.at(-1), "Hasta luego");
  });

  it("flujo registrar y reportar", async () => {
    const salidas = await correr(["1", "Ana", "1", "a@b.c", "TUP", "beca", "alta", "Beca", "", "5", "0"]);
    assert.ok(salidas.includes("Solicitud #1 registrada. Responsable asignado: Bienestar Estudiantil"));
    assert.ok(salidas.includes("Total: 1"));
    assert.ok(salidas.includes("  #1 Beca -> Bienestar Estudiantil"));
  });

  it("los errores de negocio se muestran con prefijo Error", async () => {
    assert.ok((await correr(["2", "7", "cerrada", "0"])).includes("Error: solicitud no encontrada"));
  });

  it("un ID no numérico no pide más datos", async () => {
    assert.ok((await correr(["3", "abc", "0"])).includes("Error: ID inválido"));
  });
});
