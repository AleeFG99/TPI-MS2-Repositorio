# Declaración de uso de inteligencia artificial (Sección 7 del enunciado)

| Campo | Detalle |
|---|---|
| Herramienta | Claude (Anthropic), aplicación de chat |
| Finalidad | Generar el borrador del sistema base, del diagnóstico, de los refactorings, de las pruebas, de la documentación, del informe y de la presentación |
| Grado de intervención | **Alto**: la IA produjo los borradores de código y textos. El equipo debe revisar, ejecutar, entender y justificar todo; el video se graba con voz propia |
| Verificación | Se ejecutaron pruebas automáticas sobre cada paso del refactoring (ver `docs/evidencias/`) |

> Ajustar esta declaración a lo que el equipo realmente haga y agregar los demás intercambios.

## Registro de prompts
| N.º | Fecha | Prompt (resumen fiel) | Resultado |
|---|---|---|---|
| 1 | 2026-11-07 | Se adjuntó el enunciado del TPI (TP_MS2V2.pdf), la guía y el modelo de presentación, el README del modelo y una captura con la estructura del repositorio; se pegaron las etapas obligatorias, el formato de entrega y la estructura sugerida de la presentación, y se pidió: "Realizar" | Primera versión del repositorio (Python), informe, presentación y anexo |
| 2 | 2026-11-07 | "Seguir continuando con el TPI" | Continuación: documentación, evidencias y entregables |
| 3 | 2026-11-07 | Se adjuntaron fotos de un README (Node.js 20, `npm install`, `npm start`, `npm test`, `npm run test:cov`, `scripts/comparar-versiones.sh`) y se pidió: "Podrías cambiar al repositorio que siga de esta forma" | Pregunta de aclaración sobre cómo adaptar el repositorio |
| 4 | 2026-11-07 | Se adjuntó una captura de PowerShell donde Python no está instalado; luego "Seguimos como estaba", "Donde esta python org", "Hay otra forma de correrlo sin python 3" y "Tengo node.js" | Pasos para instalar Python; propuesta de migración a Node.js |
| 5 | 2026-11-07 | "Continuar" | Migración completa del repositorio a Node.js 20, con la misma historia y tags |
| 6+ | | _(agregar aquí los prompts que el equipo use después)_ | |
