# Etapa 1 – Sistema base

**Dominio:** gestión de solicitudes académicas de estudiantes (certificados, equivalencias, exámenes, becas, otros).

**Actores:** Estudiante (quien origina la solicitud, se registra por mesa de ayuda) y Responsable/Área (Alumnos, Secretaría Académica, Bedelía, Bienestar Estudiantil, Mesa de Entradas), que opera el sistema por consola.

**Alcance:** módulo de consola, un solo usuario por vez, persistencia en archivo JSON. No incluye autenticación, interfaz web ni notificaciones.

**Entidades / estructuras principales (base):** `Solicitud`, `Estudiante`, `Responsable/Área` (texto dentro de la solicitud) y `GestorSolicitudes` (estructura que concentra los datos en memoria y el archivo).

**Funcionalidades verificables (5):** registrar solicitud · cambiar estado · asignar responsable · buscar/filtrar · reporte.

**Reglas de negocio:** validaciones de entrada (nombre, legajo numérico, email, carrera, tipo, prioridad, título ≤ 80), asignación de área según tipo, máquina de estados (`pendiente → en_proceso|rechazada`, `en_proceso → resuelta|rechazada`, `resuelta → cerrada|en_proceso`), no asignar responsable a solicitudes cerradas o rechazadas.

**Tecnología:** Node.js 20+ (módulos ES, sin dependencias), JSON (`data/solicitudes.json`) y `node:test` para las pruebas. Datos sintéticos (`data/solicitudes.ejemplo.json`).

**Versión inicial:** tag `estado-inicial` (≈ 380 líneas, 13 funciones).

**Evidencia de funcionamiento:** ver `docs/evidencias/ejecucion_sistema_base.txt` (sesión real de consola sobre `estado-inicial`).
