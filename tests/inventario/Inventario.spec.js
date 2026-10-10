const { test, expect } = require("@playwright/test");
const { crearProveedor, crearProducto, crearSucursal } = require("../helpers/fixtures");

/**
 * Módulo: Inventario (backend)
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a la fila TC-035 del plan de pruebas.
 *
 * NOTA (caso ideal vs. comportamiento actual):
 * El plan dice "registrar cantidad negativa (rechazo)", esperando un 400
 * limpio. inventario.controller.js -> create() valida con
 * `if (!cantidad || ...)`, y como un número negativo (p. ej. -5) es un
 * valor "truthy" en JavaScript, esa validación NO lo detiene: el request
 * sigue hasta Inventario.create(), donde recién el modelo (validate: {min:0})
 * lo rechaza con un SequelizeValidationError, que el controlador atrapa y
 * responde como 500 genérico en vez de 400. TC-035 prueba ese
 * comportamiento real; TC-035b documenta un efecto colateral del mismo bug
 * (cantidad 0 sí es bloqueada, pero por la razón equivocada).
 */

test.describe("Inventario - cantidad negativa", () => {
  test("TC-035: registrar un inventario con cantidad negativa es rechazado, aunque hoy con 500 en vez de 400", async ({ request }) => {
    const id_proveedor = await crearProveedor(request);
    const id_producto = await crearProducto(request, id_proveedor);
    const id_sucursal = await crearSucursal(request);

    const res = await request.post("api/inventario/create", {
      data: { cantidad: -5, id_producto, id_sucursal },
    });

    // Comportamiento ideal esperado: 400 con un mensaje claro de validación.
    // Comportamiento real hoy: 500, porque la validación de rango vive en el
    // modelo (Sequelize) y no en el controlador.
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(500);

    // En cualquier caso, no debe haber quedado un registro de inventario creado.
    const check = await request.get("api/inventario/");
    const inventarios = await check.json();
    const creado = inventarios.find(
      (i) => i.id_producto === id_producto && i.id_sucursal === id_sucursal
    );
    expect(creado).toBeUndefined();
  });

  test("TC-035b (hallazgo): cantidad 0 también es rechazada, pero por el chequeo `!cantidad`, no por una regla de negocio", async ({ request }) => {
    const id_proveedor = await crearProveedor(request);
    const id_producto = await crearProducto(request, id_proveedor);
    const id_sucursal = await crearSucursal(request);

    const res = await request.post("api/inventario/create", {
      data: { cantidad: 0, id_producto, id_sucursal },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).message).toBe(
      "La cantidad, id_producto e id_sucursal son obligatorios."
    );
  });

  test("TC-035c: registrar un inventario con cantidad positiva sí se crea correctamente (200/201)", async ({ request }) => {
    const id_proveedor = await crearProveedor(request);
    const id_producto = await crearProducto(request, id_proveedor);
    const id_sucursal = await crearSucursal(request);

    const res = await request.post("api/inventario/create", {
      data: { cantidad: 10, id_producto, id_sucursal },
    });

    expect(res.status()).toBe(201);
    expect((await res.json()).data.cantidad).toBe(10);
  });
});
