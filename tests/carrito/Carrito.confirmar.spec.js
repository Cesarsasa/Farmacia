const { test, expect } = require("@playwright/test");
const {
  crearEscenario,
  agregarAlCarrito,
  verCarrito,
  stockActual,
  ventasDeCliente,
} = require("../helpers/fixtures");

/**
 * Módulo: Carrito de compras - confirmar compra
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a las filas TC-019 y TC-020 del plan de pruebas.
 *
 * NOTA (caso ideal vs. comportamiento actual):
 * TC-019 valida el flujo feliz y pasa con el código actual.
 * TC-020 describe la regla esperada (rechazar con 400 y NO dejar rastro).
 * Hoy carrito.controller.js -> confirmarCompra() no valida el stock antes de
 * crear la venta: inserta venta + detalle y RECIÉN al descontar el inventario
 * falla (el modelo exige cantidad >= 0), respondiendo 500 y dejando una venta
 * huérfana. Esa prueba FALLA hasta corregirlo (ver parche sugerido).
 *
 * id_usuario se omite porque la columna ventas.id_usuario admite NULL y el
 * controlador no lo valida (el Swagger lo marca como requerido).
 */

test.describe("Carrito - confirmar compra", () => {
  test("TC-019: confirmar compra con stock suficiente genera la venta y descuenta el inventario", async ({ request }) => {
    const e = await crearEscenario(request, { stock: 10, precio: 25 });
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 3 });

    const res = await request.post("api/carrito/confirmar", {
      data: { id_cliente: e.id_cliente, id_sucursal: e.id_sucursal },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Compra confirmada.");
    expect(body.venta).toHaveProperty("id");
    expect(Number(body.venta.total)).toBe(75); // 3 x Q25

    // El carrito queda vacío y el inventario se descuenta (10 - 3)
    expect(await verCarrito(request, e.id_cliente)).toHaveLength(0);
    expect(await stockActual(request, e.id_inventario)).toBe(7);
  });

  test("TC-020: confirmar compra con stock insuficiente es rechazada (400) sin dejar rastro", async ({ request }) => {
    const e = await crearEscenario(request, { stock: 2, precio: 25 });
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 5 });

    const res = await request.post("api/carrito/confirmar", {
      data: { id_cliente: e.id_cliente, id_sucursal: e.id_sucursal },
    });
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(400);

    // El stock no cambia
    expect(await stockActual(request, e.id_inventario)).toBe(2);

    // El carrito sigue intacto para que el cliente pueda corregir la cantidad
    const carrito = await verCarrito(request, e.id_cliente);
    expect(carrito).toHaveLength(1);
    expect(carrito[0].cantidad).toBe(5);

    // No se creó ninguna venta huérfana
    expect(await ventasDeCliente(request, e.id_cliente)).toHaveLength(0);
  });
});
