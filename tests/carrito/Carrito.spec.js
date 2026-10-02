const { test, expect } = require("@playwright/test");

/**
 * Módulo: Carrito de compras
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a la ficha TC-AUTO-005 del informe técnico.
 */

test.describe("Módulo de Carrito", () => {

  test("TC-AUTO-005: Agregar producto al carrito con datos incompletos", async ({ request }) => {
    const res = await request.post("api/carrito/agregar", {
      data: {
        id_cliente: 1,
        // id_producto y cantidad se omiten intencionalmente para forzar la validación
      },
    });

    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.message).toBe("Datos incompletos.");
  });

});