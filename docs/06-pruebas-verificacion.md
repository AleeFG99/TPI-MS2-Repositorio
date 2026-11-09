# Etapa 6 – Pruebas y verificación del comportamiento

## Estrategia
1. **Antes de tocar el código** se escribieron 11 escenarios de caja negra (`tests/escenarios.js`) que ejecutan `node app/main.js` con una sesión de teclado completa y comparan **la salida de consola y el JSON resultante** contra un *golden master* grabado sobre `estado-inicial` (`tests/golden/`). La fecha de alta se normaliza porque cambia cada día.
2. Después de **cada** paso del refactoring se volvieron a correr: 11/11 idénticos (`docs/evidencias/pruebas_por_refactoring.txt`).
3. Al terminar se agregaron 69 pruebas unitarias y de contrato sobre las nuevas piezas (modelo, validaciones, repositorios, servicio, consultas, consola).
4. `npm run comparar` (o `scripts/comparar-versiones.sh`) repite la comparación entre los tags `estado-inicial` y `estado-refactorizado` y muestra las métricas de ambos.

## Casos cubiertos por los escenarios (comportamiento externo)
| Escenario | Qué verifica |
|---|---|
| registrar_ok / cada_tipo_asigna_area | alta, id, estado inicial, área por tipo, normalización de espacios y mayúsculas |
| registrar_errores_de_validacion | los 8 mensajes de error y el límite de 80 caracteres |
| cambiar_estado_flujo_completo / errores | máquina de estados, id inválido/inexistente, estado inválido, transición prohibida |
| asignar_responsable | éxito, vacío, inexistente, id inválido, solicitudes cerradas y rechazadas |
| buscar_y_filtrar | 4 criterios, texto sin distinguir mayúsculas, sin resultados, criterio inválido |
| reporte_vacio / con_urgentes | conteos por estado, tipo y prioridad; urgentes abiertas |
| persistencia_entre_ejecuciones | 3 procesos consecutivos sobre el mismo archivo |
| opciones_invalidas | opción desconocida y entrada vacía |

## Resultados
| Momento | Suite | Resultado |
|---|---|---|
| `estado-inicial` | 11 escenarios | 11 pasan (`pruebas_antes_estado-inicial.txt`) |
| tras R1, R2-R3, R4-R8 y correcciones | 11 escenarios | 11/11 idénticos al golden master |
| `estado-refactorizado` | 11 escenarios + 69 unitarias | 80 pasan (`pruebas_despues_estado-refactorizado.txt`) |

## Único cambio de comportamiento externo (intencional y probado)
Archivo de datos dañado: la base lo descartaba en silencio y **perdía los datos al siguiente guardado**; ahora se informa el error, se sale con código 1 y el archivo no se toca (`tests/archivo-danado.test.js`, `tests/repositorio.test.js`, `docs/evidencias/archivo_danado_antes_despues.txt`).

## Cómo ejecutar
```bash
npm test          # node --test (Node 20+, sin dependencias)
npm run test:cov  # con cobertura
npm run comparar  # estado-inicial vs estado-refactorizado
```

## Equivalencias deliberadamente preservadas
Email válido si contiene `@` y `.`; id = máximo + 1 (equivale a cantidad + 1 porque la aplicación nunca borra; probado en `servicio.test.js`).
