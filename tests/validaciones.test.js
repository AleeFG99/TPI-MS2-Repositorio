import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ValidacionError } from "../app/errores.js";
import { Prioridad, Tipo } from "../app/modelo.js";
import { DatosSolicitud, validarRegistro } from "../app/validaciones.js";

const datos = (cambios = {}) => new DatosSolicitud({
  nombre: "Ana Pérez", legajo: "40111", email: "ana@ejemplo.edu", carrera: "TUP", tipo: "certificado",
  prioridad: "alta", titulo: "Certificado", descripcion: "", ...cambios,
});

describe("validaciones", () => {
  it("datos válidos se normalizan y se tipan", () => {
    const v = validarRegistro(datos({ nombre: "  Ana  ", tipo: " BECA ", prioridad: "Media", descripcion: " hola " }));
    assert.equal(v.estudiante.nombre, "Ana");
    assert.equal(v.tipo, Tipo.BECA);
    assert.equal(v.prioridad, Prioridad.MEDIA);
    assert.equal(v.descripcion, "hola");
  });

  const casos = [
    ["nombre", "   ", /nombre no puede estar vacío/], ["legajo", "12a", /legajo debe ser numérico/],
    ["email", "sin-arroba", /email inválido/], ["email", "a@b", /email inválido/],
    ["carrera", " ", /carrera no puede estar vacía/], ["tipo", "otra-cosa", /tipo inválido/],
    ["prioridad", "urgente", /prioridad inválida/], ["titulo", "", /título no puede estar vacío/],
    ["titulo", "x".repeat(81), /no puede superar los 80 caracteres/],
  ];
  for (const [campo, valor, mensaje] of casos) {
    it(`rechaza ${campo} = ${JSON.stringify(valor.slice(0, 12))}`, () => {
      assert.throws(() => validarRegistro(datos({ [campo]: valor })), (e) => e instanceof ValidacionError && mensaje.test(e.message));
    });
  }

  it("un título de 80 caracteres es válido", () => {
    assert.equal(validarRegistro(datos({ titulo: "x".repeat(80) })).titulo.length, 80);
  });

  it("se informa el primer error en el orden histórico", () => {
    assert.throws(() => validarRegistro(datos({ nombre: "", legajo: "x", email: "x" })), /nombre no puede estar vacío/);
  });
});
