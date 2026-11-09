// Escenarios de caracterización: sesiones de consola completas (caja negra).
//   precarga : true si se copia data/solicitudes.ejemplo.json como estado inicial
//   sesiones : lista de sesiones; cada una es la lista de líneas que se escriben por stdin
//              (cada sesión es un proceso nuevo, para comprobar la persistencia entre ejecuciones)

export const reg = ({ nombre = "Ana Pérez", legajo = "40111", email = "ana@ejemplo.edu",
  carrera = "Tecnicatura en Programación", tipo = "certificado", prioridad = "alta",
  titulo = "Certificado regular", desc = "Para el trabajo" } = {}) =>
  ["1", nombre, legajo, email, carrera, tipo, prioridad, titulo, desc];
export const cambiar = (id, estado) => ["2", id, estado];
export const asignar = (id, responsable) => ["3", id, responsable];
export const buscar = (criterio, valor) => ["4", criterio, valor];
export const SALIR = ["0"];
export const REPORTE = ["5"];

export const ESCENARIOS = {
  registrar_ok: {
    precarga: false,
    sesiones: [[...reg(), ...REPORTE, ...SALIR]],
  },
  registrar_cada_tipo_asigna_area: {
    precarga: false,
    sesiones: [[
      ...reg({ tipo: "certificado" }), ...reg({ tipo: "equivalencia", prioridad: "media" }),
      ...reg({ tipo: "examen", prioridad: "baja" }), ...reg({ tipo: "BECA ", prioridad: " Alta " }),
      ...reg({ tipo: "otro" }), ...buscar("1", "pendiente"), ...SALIR,
    ]],
  },
  registrar_errores_de_validacion: {
    precarga: false,
    sesiones: [[
      ...reg({ nombre: "   " }), ...reg({ legajo: "12a" }), ...reg({ email: "sin-arroba" }), ...reg({ email: "a@b" }),
      ...reg({ carrera: " " }), ...reg({ tipo: "inexistente" }), ...reg({ prioridad: "urgente" }), ...reg({ titulo: "" }),
      ...reg({ titulo: "x".repeat(81) }), ...reg({ titulo: "x".repeat(80), desc: "" }), ...REPORTE, ...SALIR,
    ]],
  },
  cambiar_estado_flujo_completo: {
    precarga: false,
    sesiones: [[
      ...reg(), ...cambiar("1", "en_proceso"), ...cambiar("1", "resuelta"), ...cambiar("1", "en_proceso"),
      ...cambiar("1", "resuelta"), ...cambiar("1", "cerrada"), ...cambiar("1", "en_proceso"), ...REPORTE, ...SALIR,
    ]],
  },
  cambiar_estado_errores: {
    precarga: false,
    sesiones: [[
      ...reg(), ...cambiar("abc", "x"), ...cambiar("99", "cerrada"), ...cambiar("1", "volando"),
      ...cambiar("1", "resuelta"), ...cambiar("1", "pendiente"), ...cambiar("1", "rechazada"),
      ...cambiar("1", "en_proceso"), ...SALIR,
    ]],
  },
  asignar_responsable: {
    precarga: false,
    sesiones: [[
      ...reg(), ...reg({ titulo: "Segunda" }), ...reg({ titulo: "Tercera" }),
      ...asignar("1", "  Juan Pérez "), ...asignar("1", "   "), ...asignar("77", "Nadie"), ...asignar("x", "Nadie"),
      ...cambiar("2", "rechazada"), ...asignar("2", "Pedro"),
      ...cambiar("3", "en_proceso"), ...cambiar("3", "resuelta"), ...cambiar("3", "cerrada"), ...asignar("3", "Pedro"),
      ...buscar("4", "juan"), ...SALIR,
    ]],
  },
  buscar_y_filtrar: {
    precarga: true,
    sesiones: [[
      ...reg({ nombre: "Bruno Díaz", legajo: "50222", tipo: "beca", prioridad: "baja", titulo: "Beca de transporte" }),
      ...buscar("1", "pendiente"), ...buscar("1", " EN_PROCESO "), ...buscar("2", "certificado"),
      ...buscar("3", "alta"), ...buscar("4", "LUCÍA"), ...buscar("4", "50222"), ...buscar("4", "equivalencia"),
      ...buscar("2", "examen"), ...buscar("9", "x"), ...SALIR,
    ]],
  },
  reporte_vacio: {
    precarga: false,
    sesiones: [[...REPORTE, ...SALIR]],
  },
  reporte_con_urgentes_y_datos_previos: {
    precarga: true,
    sesiones: [[
      ...REPORTE, ...reg({ titulo: "Urgente A" }), ...reg({ titulo: "Urgente B" }), ...cambiar("4", "resuelta"),
      ...cambiar("4", "en_proceso"), ...cambiar("4", "resuelta"), ...cambiar("4", "cerrada"), ...REPORTE, ...SALIR,
    ]],
  },
  opciones_invalidas: {
    precarga: false,
    sesiones: [["9", "", "abc", ...SALIR]],
  },
  persistencia_entre_ejecuciones: {
    precarga: false,
    sesiones: [
      [...reg(), ...cambiar("1", "en_proceso"), ...SALIR],
      [...reg({ titulo: "Segunda sesión", tipo: "beca" }), ...asignar("1", "Laura Gil"), ...SALIR],
      [...buscar("4", ""), ...REPORTE, ...SALIR],
    ],
  },
};
