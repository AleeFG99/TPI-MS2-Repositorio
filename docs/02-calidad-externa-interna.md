# Etapa 2 – Calidad externa vs. calidad interna

## Calidad externa (lo que ve el usuario): correcta
- Las 5 operaciones funcionan y responden con mensajes claros.
- Las validaciones rechazan entradas incorrectas sin romper el programa.
- Los datos persisten entre ejecuciones y el reporte es consistente con los datos.
- Esto se comprobó con la sesión de `docs/evidencias/ejecucion_sistema_base.txt` y se fijó con las pruebas de caracterización (`tests/comportamiento-cli.test.js`).

## Calidad interna (cómo está construido): deficiente
| Dimensión | Observación en el sistema base | Consecuencia |
|---|---|---|
| Mantenibilidad | `main()` tiene 101 líneas y complejidad ciclomática 28; `registrar` 53 líneas y CC 20 | Cada cambio exige leer y entender funciones enormes |
| Legibilidad | Nombres como `lst`, `est`, `desc`, `resp`, `a…i`; concatenación de strings | Hay que adivinar la intención del código |
| Evolución | Agregar un tipo, estado o prioridad obliga a tocar 5+ lugares | Alto costo y riesgo de olvidar uno |
| Testabilidad | La lógica imprime por consola y lee archivos directamente | No se puede probar sin ejecutar la aplicación completa |
| Robustez | `catch` vacío en `cargar()` | Un archivo dañado se descarta y el siguiente guardado **pierde todos los datos** |

**Relación:** la funcionalidad visible es correcta hoy, pero la estructura interna encarece cada cambio futuro (deuda técnica). El refactoring busca bajar ese costo **sin alterar** el comportamiento externo.
