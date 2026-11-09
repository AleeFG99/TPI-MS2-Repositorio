# Etapa 5 – Refactoring seguro (antes / después)

Método: **primero pruebas, después cambios pequeños**. Las 11 pruebas de caracterización (golden master) se escribieron sobre `estado-inicial` y se volvieron a ejecutar después de cada paso (`docs/evidencias/pruebas_por_refactoring.txt`: 11/11 idénticos en todos los commits). Se puede repetir con `npm run comparar`.

| Id | Refactoring | Smells que ataca | Commit |
|---|---|---|---|
| R1 | **Extract Method** | S1, S5, S12 | `db1e1e2` |
| R2 | **Move Method** | S7 | `0cea406` |
| R3 | **Introduce Parameter Object** | S3 | `0cea406` y `e0aaf85` |
| R4 | **Replace Type Code with Enum** + Replace Conditional with Lookup Table | S4, S6 | `e0aaf85` |
| R5 | **Replace Error Codes with Exceptions** | S8 | `e0aaf85` |
| R6 | **Extract Class** (repositorio) + Introduce Interface | S2, S11 | `e0aaf85` |
| R7 | **Extract Class** (servicio, consultas, consola) + Hide Delegate | S2, S9 | `e0aaf85` |
| R8 | **Rename** (variables, atributos, parámetros) | S10 | `e0aaf85` |

## R1 – Extract Method
Antes (`GestorSolicitudes.registrar`, 53 líneas, CC 20):
```js
nombre = nombre.trim();
if (nombre === "") {
  return -1;
}
legajo = legajo.trim();
if (!/^[0-9]+$/.test(legajo)) {
  return -2;
}
// ... 6 validaciones más, if/else de área, creación y guardado
```
Después:
```js
const codigo = this._validarRegistro(nombre, legajo, email, carrera, tipo, prioridad, titulo);
if (codigo !== 0) {
  return codigo;
}
const s = new Solicitud(nuevoId, e, tipo, prioridad, titulo, desc.trim(), "pendiente",
  this._areaPara(tipo), this._fechaDeHoy());
```
También: `_buscarPorId`, `_filtrar`, `_imprimirConteos`, `_imprimirUrgentes`. **Beneficio:** funciones que se leen de un vistazo; desaparecen 4 bucles duplicados y 3 conteos repetidos.

## R2 – Move Method
Antes: `GestorSolicitudes.mostrar(s)` armaba el texto usando solo atributos de `s` (Feature Envy). Después: `Solicitud.resumen()`, `Solicitud.esUrgenteAbierta()` y `Solicitud.puedePasarA()` (la regla de transición pasó del gestor a la entidad).

## R3 – Introduce Parameter Object
Antes: `g.registrar(a, b, c, d, e, f, h, i)` (8 parámetros; 9 en `Solicitud`). Después:
```js
const datos = new DatosSolicitud({ nombre, legajo, email, carrera, tipo, prioridad, titulo, descripcion });
const solicitud = this.#servicio.registrar(datos);
```
En el último paso también `Solicitud` recibe un objeto con nombres. **Beneficio:** llamadas autodescriptivas, sin errores de orden.

## R4 – Replace Type Code with Enum / Lookup Table
Antes:
```js
if (tipo === "certificado") { resp = "Alumnos"; }
else if (tipo === "equivalencia") { resp = "Secretaría Académica"; }
// ...
```
Después:
```js
export const AREA_POR_TIPO = new Map([[Tipo.CERTIFICADO, "Alumnos"], [Tipo.EQUIVALENCIA, "Secretaría Académica"], /* ... */]);
responsable: AREA_POR_TIPO.get(validados.tipo)
```
Igual con `TRANSICIONES` (máquina de estados) y `FILTROS` (criterios de búsqueda). Se usan `Map` y no objetos planos para que entradas como `"constructor"` no se confundan con claves (hay una prueba).

## R5 – Replace Error Codes with Exceptions
Antes (`main.js`): `const r = g.registrar(...)` seguido de 8 ramas `else if (r === -N)`; `cambiarEstado` devolvía número o texto. Después:
```js
try {
  await accion();
} catch (error) {
  if (!(error instanceof SolicitudError)) throw error;
  this.#salida(`Error: ${error.message}`);
}
```
Los mensajes viajan dentro de la excepción (`ValidacionError`, `SolicitudNoEncontrada`, `TransicionNoPermitida`, `AsignacionNoPermitida`, `RepositorioError`).

## R6 – Extract Class: repositorio (+ interfaces)
Antes: `cargar()`/`guardar()` dentro del gestor, con `catch` vacío y ruta fija. Después: `RepositorioJson` y `RepositorioMemoria` con una interfaz documentada con JSDoc (`LectorSolicitudes` / `RepositorioSolicitudes`). Un archivo dañado ahora se informa y **no se sobrescribe** (mejora deliberada, ver `docs/evidencias/archivo_danado_antes_despues.txt`).

## R7 – Extract Class: servicio, consultas, consola
Antes: `main` hacía `g.lst[r - 1].resp` y recorría `g.lst`. Después: `ServicioSolicitudes.registrar()` devuelve la `Solicitud` creada; `main.js` solo compone y delega.

## R8 – Rename
`lst→solicitudes`, `est→estudiante`, `desc→descripcion`, `resp→responsable`, `x,y,r→id,texto,solicitud`.

## Resultado (métricas, `docs/evidencias/`)
| Métrica | estado-inicial | estado-refactorizado |
|---|---|---|
| Función más larga (LOC) | 101 | 23 |
| Complejidad ciclomática máxima | 28 | 8 |
| CC promedio | 9.1 | 1.9 |
| Funciones con CC > 10 | 5 | 0 |
| Máx. parámetros de una función | 9 | 4 |
| Módulos / funciones | 3 / 13 | 8 / 47 |

Las métricas las calcula `docs/herramientas/metricas.mjs` (análisis aproximado por expresiones regulares, no un AST).
