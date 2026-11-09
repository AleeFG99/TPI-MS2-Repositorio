# Etapa 8 – Conclusiones y aprendizaje

## Decisiones tomadas
- Escribir las pruebas de caracterización **antes** de refactorizar, comparando salida y datos.
- Refactorizar en pasos pequeños (R1 → R2/R3 → R4-R8), verificando cada uno.
- Conservar el formato del JSON y los mensajes de consola para no romper datos ni hábitos de uso.
- Mejorar a propósito solo el comportamiento ante archivos dañados; el resto de los cambios del code review son correcciones de robustez sin efecto en el uso normal.
- Node.js 20 sin dependencias: `node:test` para las pruebas y cobertura integrada.

## Dificultades
- El comportamiento "externo" incluye detalles (orden de las validaciones, orden de los prompts, mensajes) que hubo que respetar aunque fueran mejorables.
- La fecha de alta cambia cada día: se normalizó en las pruebas.
- JavaScript no tiene interfaces: hubo que documentarlas con JSDoc y confiar en las pruebas de contrato.
- Distinguir qué es un cambio de estructura y qué es un cambio de comportamiento.

## Límites del trabajo
- Interfaz de consola, un usuario, sin autenticación; persistencia en un único JSON.
- Las métricas son aproximadas (script propio), no una herramienta profesional.
- El golden master cubre los caminos principales, no todas las combinaciones posibles.

## Mejoras pendientes
Validación de email real (CR-01), ESLint y verificación de tipos con `tsc --checkJs` (CR-07), SQLite como segundo repositorio (el diseño ya lo permite), borrado lógico.

## Relación con la asignatura
Calidad externa vs. interna, deuda técnica, code smells, SOLID, Clean Code, refactoring seguro con pruebas, y revisión técnica con checklist.

## Conclusiones grupales
La calidad interna no se ve desde la interfaz, pero el costo de agregar un tipo, un estado o un criterio de búsqueda pasó de "editar 6 lugares en 2 archivos" a "agregar una fila en una tabla".

## Conclusiones individuales (completar)
- Integrante 1: _______________________
- Integrante 2: _______________________
- Integrante 3: _______________________
- Integrante 4: _______________________
