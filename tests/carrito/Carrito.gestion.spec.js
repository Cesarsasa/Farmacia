const { test, expect } = require("@playwright/test");
const {
  crearEscenario,
  crearProducto,
  crearCliente,
  agregarAlCarrito,
  verCarrito,
} = require("../helpers/fixtures");

/**
 * Módulo: Carrito de compras - gestión de ítems
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a las filas TC-015, TC-016 y TC-017 del plan de pruebas.
 *
 * Cada prueba crea sus propios datos (cliente, producto, etc.) vía la API,
 * así no depende de datos sembrados ni de otras pruebas.
 *
 * NOTA (caso ideal vs. comportamiento actual):
 * TC-015 y TC-016 describen la regla de negocio esperada. Hoy
 * carrito.controller.js -> actualizarCantidad() guarda cualquier valor
 * sin validarlo, por lo que estas dos pruebas FALLAN hasta que se agregue
 * la validación (ver parche sugerido en la respuesta).
 */

test.describe("Carrito - gestión de ítems", () => {
  test("TC-015: actualizar la cantidad a 0 elimina el ítem del carrito", async ({ request }) => {
    const e = await crearEscenario(request);
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });

    const res = await request.put("api/carrito/actualizar", {
      data: { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 0 },
    });
    expect(res.status()).toBe(200);

    const carrito = await verCarrito(request, e.id_cliente);
    expect(carrito).toHaveLength(0); // el ítem ya no debe existir
  });

  test("TC-016: actualizar la cantidad a un valor negativo es rechazado (400)", async ({ request }) => {
    const e = await crearEscenario(request);
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });

    const res = await request.put("api/carrito/actualizar", {
      data: { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: -3 },
    });
    expect(res.status()).toBe(400);

    // La cantidad original no debe haberse modificado
    const carrito = await verCarrito(request, e.id_cliente);
    expect(carrito).toHaveLength(1);
    expect(carrito[0].cantidad).toBe(2);
  });

  test("TC-017: vaciar el carrito elimina todos los ítems del cliente (y solo los suyos)", async ({ request }) => {
    const e = await crearEscenario(request);
    const idProducto2 = await crearProducto(request, e.id_proveedor, 40);
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 1 });
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: idProducto2, cantidad: 3 });

    // Otro cliente con un ítem propio: NO debe verse afectado
    const otro = await crearCliente(request);
    await agregarAlCarrito(request, { id_cliente: otro.id, id_producto: e.id_producto, cantidad: 1 });

    expect(await verCarrito(request, e.id_cliente)).toHaveLength(2);

    const res = await request.delete(`api/carrito/vaciar/${e.id_cliente}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).message).toBe("Carrito vaciado.");

    expect(await verCarrito(request, e.id_cliente)).toHaveLength(0);
    expect(await verCarrito(request, otro.id)).toHaveLength(1);

    // Limpieza del carrito del segundo cliente
    await request.delete(`api/carrito/vaciar/${otro.id}`);
  });
});
