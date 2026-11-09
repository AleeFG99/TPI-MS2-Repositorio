# Etapa 4 – Aplicación de SOLID y Clean Code

| Principio | Problema en `estado-inicial` | Mejora aplicada | Dónde queda |
|---|---|---|---|
| **SRP** | `GestorSolicitudes` hacía persistencia, validación, reglas, búsqueda, impresión y reporte | Una responsabilidad por módulo: `repositorio` (datos), `validaciones` (entrada), `modelo` (reglas), `servicio` (comandos), `consultas` (lectura), `consola` (I/O) | `app/*.js` |
| **OCP** | `if/elif` por tipo, estado y criterio: un valor nuevo obliga a editar código existente | Tablas de reglas `AREA_POR_TIPO`, `TRANSICIONES` y `FILTROS` (`Map`): se agrega una fila | `modelo.js`, `consultas.js` |
| **LSP** | No había abstracción que sustituir | `RepositorioMemoria` y `RepositorioJson` cumplen el mismo contrato; las pruebas de contrato corren sobre ambas | `repositorio.js`, `tests/repositorio.test.js` |
| **ISP** | El gestor exponía todo a todos | `LectorSolicitudes` (solo `cargar`) para las consultas y `RepositorioSolicitudes` (`cargar`+`guardar`) para los comandos | `repositorio.js` |
| **DIP** | `GestorSolicitudes` dependía de `open()`, de una ruta fija y de `print` | Servicio y consultas reciben el repositorio; la consola recibe `entrada`/`salida` (el JS no tiene interfaces: se documentan con JSDoc `@typedef` y se usa duck typing); `main.js` es el único lugar donde se arman las piezas | `main.js`, `consola.js` |

## Clean Code
- **Nombres:** `lst`→`solicitudes`, `est`→`estudiante`, `desc`→`descripcion`, `resp`→`responsable`, `a…i`→`nombre…descripcion`.
- **Funciones pequeñas:** la más larga pasó de 101 a 23 líneas; la complejidad máxima de 28 a 8.
- **Errores:** excepciones con mensaje (`SolicitudError` y derivadas) en lugar de códigos `-1…-8`; se eliminó el `catch` vacío.
- **Sin números/strings mágicos:** `Tipo`, `Prioridad`, `Estado` (enumeraciones con `Object.freeze`) y `MAX_LARGO_TITULO`.
- **Cohesión y acoplamiento:** las reglas de la solicitud viven en `Solicitud` (`cambiar_estado`, `asignar_responsable`); la consola ya no conoce la estructura interna.
- **Código muerto eliminado** (bloque comentado `guardarViejo`).
