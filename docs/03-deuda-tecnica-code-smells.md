# Etapa 3 – Deuda técnica y code smells (estado-inicial)

Métricas base (`docs/evidencias/metricas_estado-inicial.txt`): 378 LOC, máx. 101 líneas por función, máx. 9 parámetros, CC máxima 28, 5 funciones con CC > 10.

| # | Code smell | Evidencia | Ubicación | Impacto | Riesgo de mantenimiento | Prioridad |
|---|---|---|---|---|---|---|
| S1 | **Long Method** | `registrar` (53 líneas, CC 20) mezcla validar, normalizar, asignar área, crear y persistir; `main` tiene 101 líneas | `gestor.js:61-113`, `main.js:13-111` | Difícil de entender y probar | Alto | Alta |
| S2 | **God Class / Divergent Change** | `GestorSolicitudes` carga/guarda JSON, valida, aplica reglas, busca, imprime y arma el reporte | `gestor.js:12-262` | Cualquier cambio toca la misma clase | Alto | Alta |
| S3 | **Long Parameter List / Data Clump** | `registrar(nombre, legajo, email, carrera, tipo, prioridad, titulo, desc)`; `Solicitud.__init__` con 9 parámetros | `gestor.js:61`, `modelo.js:13` | Llamadas propensas a errores de orden | Medio | Alta |
| S4 | **Primitive Obsession / Magic Strings** | tipo, prioridad y estado son strings repetidos (`"pendiente"`, `"alta"`…) en más de 30 lugares | `gestor.js` (todo), `main.js` | Un typo no se detecta y agregar un valor exige editar muchos sitios | Alto | Alta |
| S5 | **Duplicated Code** | búsqueda por id repetida; 4 bucles casi iguales en `buscar`; 3 conteos iguales en `reporte`; cadenas de `!=` repetidas | `gestor.js:115-171,177-215,217-261` | Correcciones inconsistentes | Medio | Media |
| S6 | **Switch Statements (if/elif sobre tipo)** | `if tipo == "certificado" … elif …` para elegir área | `gestor.js:93-104` | Viola OCP: nuevo tipo = modificar código existente | Medio | Media |
| S7 | **Feature Envy** | `mostrar(s)` y la regla "urgente" usan solo datos de `Solicitud`; la regla de transición vive en el gestor | `gestor.js:131-143,173-175,252-255` | Lógica lejos de los datos que usa | Medio | Media |
| S8 | **Error codes + Swallowed exception** | `registrar` devuelve -1…-8 y `main` decodifica con `if/elif`; `cambiar_estado` devuelve a veces `int` y a veces `str`; `catch` vacío en `cargar` | `gestor.js:32-34,61-113`, `main.js:35-50` | Errores ocultos y **pérdida silenciosa de datos** | Muy alto | **Crítica** |
| S9 | **Inappropriate Intimacy** | `main` accede a `g.lst[r - 1].resp` y recorre `g.lst` | `main.js:52,66-71` | Acoplamiento a la estructura interna (y supone ids contiguos) | Medio | Media |
| S10 | **Poor Naming** | `lst`, `est`, `desc`, `resp`, `n`, `k`, `a…i`, `x`, `y` | `gestor.js`, `main.js`, `modelo.js` | Código ilegible | Medio | Media |
| S11 | **Mixed I/O and logic (DIP violation)** | `buscar` y `reporte` hacen `print`; el gestor depende de `fs`/ruta fija | `gestor.js:3,52-58,177-261` | No se puede probar ni cambiar persistencia | Alto | Alta |
| S12 | **Dead / commented-out code** | bloque comentado `guardar_viejo` | `gestor.js:6-10` | Ruido | Bajo | Baja |

**Priorización:** primero S8 (riesgo de pérdida de datos), luego S4/S2/S1/S11 (base de la evolución), después S3/S5/S6/S7/S9/S10 y finalmente S12.

## Deuda técnica
- **Deuda deliberada/imprudente:** el sistema creció por acumulación sin rediseñar (funcionalidad → más `if`).
- **Costo del cambio:** agregar el tipo "pasantía" o el estado "en_espera" implica editar 6+ lugares en 2 archivos.
- **Comportamientos a preservar aunque sean mejorables** (se documentan como mejoras futuras y no se cambian en el refactoring): validación de email débil (`"@"` y `"."`), id = cantidad + 1.
