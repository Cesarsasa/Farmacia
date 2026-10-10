const { test, expect } = require("@playwright/test");
const {
  crearProveedor,
  crearProducto,
  crearSucursal,
  crearInventario,
  crearCliente,
} = require("../helpers/fixtures");

/**
 * Módulo: Inventario (backend)
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a la fila TC-036 del plan de pruebas
 * ("Actualización de stock tras una venta").
 *
 * Usa POST /api/ventas/create (venta.controller.js), que es el endpoint que
 * de verdad descuenta inventario con Inventario.decrement(). Es un
 * controlador distinto al de carrito.controller.js -> confirmarCompra().
 */

test.describe("Inventario - actualización de stock tras una venta", () => {
  test("TC-036: registrar una venta descuenta la cantidad vendida del inventario", async ({ request }) => {
    const id_proveedor = await crearProveedor(request);
    const id_producto = await crearProducto(request, id_proveedor, 25);
    const id_sucursal = await crearSucursal(request);
    await crearInventario(request, { id_producto, id_sucursal, cantidad: 20 });
    const cliente = await crearCliente(request);

    const res = await request.post("api/ventas/create", {
      data: {
        id_cliente: cliente.id,
        id_usuario: null,
        id_sucursal,
        detalle_ventas: [{ id_producto, cantidad: 7, precio_unitario: 25 }],
      },
    });
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(201);

    const check = await request.get("api/inventario/");
    const inventarios = await check.json();
    const registro = inventarios.find(
      (i) => i.id_producto === id_producto && i.id_sucursal === id_sucursal
    );
    expect(registro.cantidad).toBe(13); // 20 - 7
  });

  test("TC-036b: vender más unidades de las que hay en inventario es rechazado (400) y el stock no cambia", async ({ request }) => {
    const id_proveedor = await crearProveedor(request);
    const id_producto = await crearProducto(request, id_proveedor, 25);
    const id_sucursal = await crearSucursal(request);
    await crearInventario(request, { id_producto, id_sucursal, cantidad: 3 });
    const cliente = await crearCliente(request);

    const res = await request.post("api/ventas/create", {
      data: {
        id_cliente: cliente.id,
        id_usuario: null,
        id_sucursal,
        detalle_ventas: [{ id_producto, cantidad: 10, precio_unitario: 25 }],
      },
    });
    expect(res.status()).toBe(400);

    const check = await request.get("api/inventario/");
    const inventarios = await check.json();
    const registro = inventarios.find(
      (i) => i.id_producto === id_producto && i.id_sucursal === id_sucursal
    );
    expect(registro.cantidad).toBe(3); // sin cambios
  });

  test("TC-036c: una venta con varias líneas de producto descuenta cada una por separado", async ({ request }) => {
    const id_proveedor = await crearProveedor(request);
    const idA = await crearProducto(request, id_proveedor, 10);
    const idB = await crearProducto(request, id_proveedor, 15);
    const id_sucursal = await crearSucursal(request);
    await crearInventario(request, { id_producto: idA, id_sucursal, cantidad: 10 });
    await crearInventario(request, { id_producto: idB, id_sucursal, cantidad: 10 });
    const cliente = await crearCliente(request);

    const res = await request.post("api/ventas/create", {
      data: {
        id_cliente: cliente.id,
        id_usuario: null,
        id_sucursal,
        detalle_ventas: [
          { id_producto: idA, cantidad: 4, precio_unitario: 10 },
          { id_producto: idB, cantidad: 6, precio_unitario: 15 },
        ],
      },
    });
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(201);
    expect((await res.json()).venta.total).toBe("130.00"); // 4*10 + 6*15

    const check = await request.get("api/inventario/");
    const inventarios = await check.json();
    expect(
      inventarios.find((i) => i.id_producto === idA && i.id_sucursal === id_sucursal).cantidad
    ).toBe(6); // 10 - 4
    expect(
      inventarios.find((i) => i.id_producto === idB && i.id_sucursal === id_sucursal).cantidad
    ).toBe(4); // 10 - 6
  });
});
