# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: carrito\Carrito.confirmar.spec.js >> Carrito - confirmar compra >> TC-019: confirmar compra con stock suficiente genera la venta y descuenta el inventario
- Location: tests\carrito\Carrito.confirmar.spec.js:28:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | const {
  3  |   crearEscenario,
  4  |   agregarAlCarrito,
  5  |   verCarrito,
  6  |   stockActual,
  7  |   ventasDeCliente,
  8  | } = require("../helpers/fixtures");
  9  | 
  10 | /**
  11 |  * Módulo: Carrito de compras - confirmar compra
  12 |  * Herramienta: Playwright (pruebas de API)
  13 |  * Corresponde a las filas TC-019 y TC-020 del plan de pruebas.
  14 |  *
  15 |  * NOTA (caso ideal vs. comportamiento actual):
  16 |  * TC-019 valida el flujo feliz y pasa con el código actual.
  17 |  * TC-020 describe la regla esperada (rechazar con 400 y NO dejar rastro).
  18 |  * Hoy carrito.controller.js -> confirmarCompra() no valida el stock antes de
  19 |  * crear la venta: inserta venta + detalle y RECIÉN al descontar el inventario
  20 |  * falla (el modelo exige cantidad >= 0), respondiendo 500 y dejando una venta
  21 |  * huérfana. Esa prueba FALLA hasta corregirlo (ver parche sugerido).
  22 |  *
  23 |  * id_usuario se omite porque la columna ventas.id_usuario admite NULL y el
  24 |  * controlador no lo valida (el Swagger lo marca como requerido).
  25 |  */
  26 | 
  27 | test.describe("Carrito - confirmar compra", () => {
  28 |   test("TC-019: confirmar compra con stock suficiente genera la venta y descuenta el inventario", async ({ request }) => {
  29 |     const e = await crearEscenario(request, { stock: 10, precio: 25 });
  30 |     await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 3 });
  31 | 
  32 |     const res = await request.post("api/carrito/confirmar", {
  33 |       data: { id_cliente: e.id_cliente, id_sucursal: e.id_sucursal },
  34 |     });
  35 | 
> 36 |     expect(res.status()).toBe(200);
     |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  37 |     const body = await res.json();
  38 |     expect(body.message).toBe("Compra confirmada.");
  39 |     expect(body.venta).toHaveProperty("id");
  40 |     expect(Number(body.venta.total)).toBe(75); // 3 x Q25
  41 | 
  42 |     // El carrito queda vacío y el inventario se descuenta (10 - 3)
  43 |     expect(await verCarrito(request, e.id_cliente)).toHaveLength(0);
  44 |     expect(await stockActual(request, e.id_inventario)).toBe(7);
  45 |   });
  46 | 
  47 |   test("TC-020: confirmar compra con stock insuficiente es rechazada (400) sin dejar rastro", async ({ request }) => {
  48 |     const e = await crearEscenario(request, { stock: 2, precio: 25 });
  49 |     await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 5 });
  50 | 
  51 |     const res = await request.post("api/carrito/confirmar", {
  52 |       data: { id_cliente: e.id_cliente, id_sucursal: e.id_sucursal },
  53 |     });
  54 |     expect(res.status(), `respuesta: ${await res.text()}`).toBe(400);
  55 | 
  56 |     // El stock no cambia
  57 |     expect(await stockActual(request, e.id_inventario)).toBe(2);
  58 | 
  59 |     // El carrito sigue intacto para que el cliente pueda corregir la cantidad
  60 |     const carrito = await verCarrito(request, e.id_cliente);
  61 |     expect(carrito).toHaveLength(1);
  62 |     expect(carrito[0].cantidad).toBe(5);
  63 | 
  64 |     // No se creó ninguna venta huérfana
  65 |     expect(await ventasDeCliente(request, e.id_cliente)).toHaveLength(0);
  66 |   });
  67 | });
  68 | 
```