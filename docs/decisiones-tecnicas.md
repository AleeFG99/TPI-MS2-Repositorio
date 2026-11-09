# Decisiones técnicas (ADR resumidos)

| Id | Decisión | Motivo | Alternativa descartada |
|---|---|---|---|
| D1 | Golden master por consola (caja negra) antes de refactorizar | Las firmas internas cambian; el comportamiento externo no | Pruebas unitarias sobre la base: se romperían con cada cambio de interfaz |
| D2 | Mantener formato JSON y mensajes | Compatibilidad con datos existentes | Cambiar a SQLite en este TPI (fuera de alcance) |
| D3 | Interfaces documentadas con JSDoc (`@typedef`) y duck typing | JavaScript no tiene interfaces; evita agregar TypeScript al TPI | TypeScript (queda como mejora, CR-07) |
| D4 | Enumeraciones con `Object.freeze` | Valores que se comparan y serializan como texto | Strings sueltos |
| D5 | Reglas como `Map` (`AREA_POR_TIPO`, `TRANSICIONES`, `FILTROS`) | OCP; un `Map` no confunde claves como `"constructor"` | Jerarquía de clases por tipo (sobreingeniería) |
| D6 | Excepciones con el mensaje de usuario | Elimina códigos y `else if` | Códigos de error |
| D7 | Preservar email débil e id = max+1 | Refactoring no cambia comportamiento | Corregirlos ahora (queda como mejora, CR-01) |
| D8 | Archivo dañado: informar y no tocar | Evita pérdida silenciosa de datos | Descartar y seguir (base) |
| D9 | Tags `estado-inicial`, `estado-refactorizado`, `etapa-*` | Requisito del TPI | — |
| D10 | Node.js 20, módulos ES, sin dependencias, `node:test` | `npm install` no baja nada; el equipo ya usa Node | Jest/Mocha |
