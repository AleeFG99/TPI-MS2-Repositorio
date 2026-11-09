# Gestión de Solicitudes Académicas

Módulo de consola en Node.js para registrar solicitudes de estudiantes, clasificarlas por tipo, prioridad y estado, asignar responsable, buscar/filtrar y generar un reporte.

**Trabajo Práctico Integrador – Metodología de Sistemas II** (Tecnicatura Universitaria en Programación a Distancia, UTN): evolución profesional de un sistema existente (calidad, deuda técnica, refactoring y code review).

## Instalación y uso

Requiere Node.js 20 o superior.

```bash
npm install        # no hay dependencias; es opcional
npm start          # menú interactivo en la consola
```

Los datos se guardan en `data/solicitudes.json` (sintéticos, sin información personal real). Para empezar con datos de muestra, copiar `data/solicitudes.ejemplo.json` como `data/solicitudes.json`.

Ejemplos:

```text
=== Gestión de Solicitudes Académicas ===
1. Registrar solicitud      2. Cambiar estado      3. Asignar responsable
4. Buscar / filtrar         5. Reporte             0. Salir

Opción: 1   → pide nombre, legajo, email, carrera, tipo, prioridad, título y descripción
            → "Solicitud #3 registrada. Responsable asignado: Alumnos"
Opción: 2   → ID 3, nuevo estado en_proceso
            → "Estado de la solicitud #3 actualizado: pendiente -> en_proceso"
Opción: 4   → criterio 4 (texto), valor "lucía"  → lista las solicitudes que coinciden
Opción: 5   → totales por estado, tipo y prioridad, y urgentes abiertas
```

Estados: `pendiente → en_proceso → resuelta → cerrada` (también `rechazada`). Tipos: certificado, equivalencia, examen, beca, otro. Prioridades: alta, media, baja.

## Pruebas

```bash
npm test                              # 80 pruebas (node --test)
npm run test:cov                      # con cobertura
scripts/comparar-versiones.sh         # estado-inicial vs estado-refactorizado (en Windows: npm run comparar)
```

`comparar-versiones` ejecuta los mismos escenarios de consola sobre los dos tags, verifica que la salida y los datos son idénticos y muestra las métricas de cada versión.

## Arquitectura (estado-refactorizado)

```
app/
  main.js          composición de dependencias
  consola.js       interfaz de consola (entrada/salida inyectables)
  servicio.js      comandos: registrar, cambiar estado, asignar
  consultas.js     lectura: buscar y reporte
  validaciones.js  DatosSolicitud (parameter object) y reglas de entrada
  modelo.js        Solicitud, Estudiante, enumeraciones y tablas de reglas
  repositorio.js   RepositorioJson / RepositorioMemoria (interfaces JSDoc)
  errores.js       excepciones de dominio
data/              datos (JSON)
tests/             pruebas (golden master + unitarias)
scripts/           comparar-versiones
docs/              documentación y evidencias
```

## Versiones (tags)

| Tag | Contenido |
|---|---|
| `estado-inicial` | Sistema base, con problemas de diseño |
| `etapa-diagnostico` | Diagnóstico: calidad, deuda técnica y 12 code smells |
| `pruebas-caracterizacion` | Golden master previo al refactoring |
| `etapa-refactoring` | Refactorings R1 a R8 |
| `etapa-pruebas` | Pruebas unitarias y verificación |
| `etapa-docs` | Code review, documentación y evidencias |
| `estado-refactorizado` (y `estadorefactorizado`) | Estado final |

Comparar: `git diff estado-inicial estado-refactorizado --stat`

## Documentación (`docs/`)

`01-sistema-base` · `02-calidad-externa-interna` · `03-deuda-tecnica-code-smells` · `04-solid-clean-code` · `05-refactorings` · `06-pruebas-verificacion` · `07-code-review` · `08-conclusiones` · `decisiones-tecnicas` · `uso-ia` · `participacion` · `guion-video` · `evidencias/` · `herramientas/metricas.mjs`

## Tecnologías

Node.js 20 (módulos ES, sin dependencias) · `node:test` · JSON · Git.

## Enlaces (completar)

Video: _pendiente_ · Informe PDF: _pendiente_
