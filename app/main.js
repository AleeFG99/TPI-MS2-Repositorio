// Punto de entrada: arma las dependencias (composición) y lanza la consola.
import readline from "node:readline";
import { pathToFileURL } from "node:url";
import { ConsolaCLI } from "./consola.js";
import { ConsultasSolicitudes } from "./consultas.js";
import { RepositorioError } from "./errores.js";
import { RUTA_DATOS, RepositorioJson } from "./repositorio.js";
import { ServicioSolicitudes } from "./servicio.js";

/** Devuelve el código de salida (0 = OK). Todas las dependencias externas son inyectables. */
export async function main({ entrada, salida = console.log, ruta = RUTA_DATOS } = {}) {
  const repositorio = new RepositorioJson(ruta);
  try {
    repositorio.cargar(); // falla temprano: si el archivo está dañado no se sobrescribe nada
  } catch (error) {
    if (error instanceof RepositorioError) {
      salida(`Error: ${error.message}`);
      return 1;
    }
    throw error;
  }
  const consola = new ConsolaCLI({
    servicio: new ServicioSolicitudes(repositorio), consultas: new ConsultasSolicitudes(repositorio), entrada, salida,
  });
  await consola.ejecutar();
  return 0;
}

function entradaDesdeTeclado() {
  const rl = readline.createInterface({ input: process.stdin });
  const lineas = rl[Symbol.asyncIterator]();
  const entrada = async (prompt) => {
    process.stdout.write(prompt);
    const siguiente = await lineas.next();
    return siguiente.done ? "0" : siguiente.value; // fin de la entrada = salir
  };
  return { entrada, cerrar: () => rl.close() };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { entrada, cerrar } = entradaDesdeTeclado();
  main({ entrada }).then((codigo) => { process.exitCode = codigo; }).finally(cerrar);
}
