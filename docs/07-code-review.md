# Etapa 7 – Code review profesional

## Checklist técnico
| # | Criterio de revisión | Resultado |
|---|---|---|
| 1 | Nombres expresivos, sin abreviaturas crípticas | OK |
| 2 | Funciones cortas (≤ 25 líneas) y complejidad ≤ 10 | OK (máx. 23 líneas / CC 8) |
| 3 | Una responsabilidad por módulo/clase (SRP) | OK |
| 4 | Extensible sin modificar código existente (OCP) | OK (tablas de reglas) |
| 5 | Dependencias hacia abstracciones (DIP/ISP/LSP) | OK (inyección + interfaces JSDoc) |
| 6 | Sin duplicación ni código muerto | OK |
| 7 | Sin strings/números mágicos | OK |
| 8 | Manejo de errores explícito, sin `catch` vacío | OK |
| 9 | Entrada validada en un único lugar | OK (`validaciones.js`) |
| 10 | Lógica separada de I/O (se prueba sin consola ni archivos) | OK |
| 11 | Pruebas que respaldan cada comportamiento relevante | OK (80) |
| 12 | Persistencia robusta ante cortes y archivos dañados | OK tras CR-03 y CR-05 |
| 13 | Casos borde de JavaScript (límites de pila, claves de objetos) | OK tras CR-06 |
| 14 | README, instalación y `/docs` actualizados | OK |
| 15 | Historial de commits claro con tags por etapa; datos sintéticos | OK |

## Observaciones, feedback y acciones
| Id | Observación (feedback objetivo) | Severidad | Acción | Estado |
|---|---|---|---|---|
| CR-01 | La validación de email solo exige `@` y `.` (heredada de la base) | Media | Se preserva para no cambiar el comportamiento externo; validación más estricta como mejora futura | Aceptada / pendiente |
| CR-02 | `Solicitud` tiene 9 campos | Baja | Es un registro de datos; el constructor recibe un objeto con nombres | Aceptada |
| CR-03 | `RepositorioJson.guardar` escribía directo sobre el archivo: un corte dejaba el JSON a medias | Alta | Escritura a `.tmp` + `renameSync`; prueba "guarda de forma atómica…" | **Corregida** (`de2b13d`) |
| CR-04 | Cada operación recarga el archivo completo | Baja | Aceptable para el alcance (cientos de solicitudes); documentado | Aceptada |
| CR-05 | Un JSON válido pero con otra forma (`{}`, `[{"id":1}]`, tipo desconocido) provocaba `TypeError` sin controlar o cargaba datos a medias | Alta | Verificación de forma y valores al cargar → `RepositorioError`; 4 pruebas | **Corregida** (`de2b13d`) |
| CR-06 | `Math.max(0, ...ids)` lanza `RangeError` con ~125.000 solicitudes (límite de argumentos) | Media | `reduce`; prueba con 200.000 registros | **Corregida** (`de2b13d`) |
| CR-07 | JSDoc documenta las interfaces pero nada las verifica | Baja | ESLint y `tsc --checkJs` como mejora futura | Pendiente |
| CR-08 | id = máximo + 1 reemplaza a cantidad + 1 | Baja | Equivalente en estados alcanzables; probado | Aceptada |
| CR-09 | El README describía la base | Media | README y `/docs` actualizados | **Corregida** |

## Criterios de aceptación técnica
Se acepta el cambio si: (a) las 80 pruebas pasan; (b) los 11 escenarios de caja negra siguen idénticos al golden master (`npm run comparar`); (c) ninguna función supera CC 10; (d) no hay hallazgos de severidad Alta abiertos; (e) la documentación refleja el código.
