# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventario\Inventario.stock.spec.js >> Inventario - actualización de stock tras una venta >> TC-036c: una venta con varias líneas de producto descuenta cada una por separado
- Location: tests\inventario\Inventario.stock.spec.js:72:3

# Error details

```
Error: respuesta: {"message":"Error al registrar la venta."}

expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 500
```

# Test source

```ts
  1   | const { test, expect } = require("@playwright/test");
  2   | const {
  3   |   crearProveedor,
  4   |   crearProducto,
  5   |   crearSucursal,
  6   |   crearInventario,
  7   |   crearCliente,
  8   | } = require("../helpers/fixtures");
  9   | 
  10  | /**
  11  |  * Módulo: Inventario (backend)
  12  |  * Herramienta: Playwright (pruebas de API)
  13  |  * Corresponde a la fila TC-036 del plan de pruebas
  14  |  * ("Actualización de stock tras una venta").
  15  |  *
  16  |  * Usa POST /api/ventas/create (venta.controller.js), que es el endpoint que
  17  |  * de verdad descuenta inventario con Inventario.decrement(). Es un
  18  |  * controlador distinto al de carrito.controller.js -> confirmarCompra().
  19  |  */
  20  | 
  21  | test.describe("Inventario - actualización de stock tras una venta", () => {
  22  |   test("TC-036: registrar una venta descuenta la cantidad vendida del inventario", async ({ request }) => {
  23  |     const id_proveedor = await crearProveedor(request);
  24  |     const id_producto = await crearProducto(request, id_proveedor, 25);
  25  |     const id_sucursal = await crearSucursal(request);
  26  |     await crearInventario(request, { id_producto, id_sucursal, cantidad: 20 });
  27  |     const cliente = await crearCliente(request);
  28  | 
  29  |     const res = await request.post("api/ventas/create", {
  30  |       data: {
  31  |         id_cliente: cliente.id,
  32  |         id_usuario: null,
  33  |         id_sucursal,
  34  |         detalle_ventas: [{ id_producto, cantidad: 7, precio_unitario: 25 }],
  35  |       },
  36  |     });
  37  |     expect(res.status(), `respuesta: ${await res.text()}`).toBe(201);
  38  | 
  39  |     const check = await request.get("api/inventario/");
  40  |     const inventarios = await check.json();
  41  |     const registro = inventarios.find(
  42  |       (i) => i.id_producto === id_producto && i.id_sucursal === id_sucursal
  43  |     );
  44  |     expect(registro.cantidad).toBe(13); // 20 - 7
  45  |   });
  46  | 
  47  |   test("TC-036b: vender más unidades de las que hay en inventario es rechazado (400) y el stock no cambia", async ({ request }) => {
  48  |     const id_proveedor = await crearProveedor(request);
  49  |     const id_producto = await crearProducto(request, id_proveedor, 25);
  50  |     const id_sucursal = await crearSucursal(request);
  51  |     await crearInventario(request, { id_producto, id_sucursal, cantidad: 3 });
  52  |     const cliente = await crearCliente(request);
  53  | 
  54  |     const res = await request.post("api/ventas/create", {
  55  |       data: {
  56  |         id_cliente: cliente.id,
  57  |         id_usuario: null,
  58  |         id_sucursal,
  59  |         detalle_ventas: [{ id_producto, cantidad: 10, precio_unitario: 25 }],
  60  |       },
  61  |     });
  62  |     expect(res.status()).toBe(400);
  63  | 
  64  |     const check = await request.get("api/inventario/");
  65  |     const inventarios = await check.json();
  66  |     const registro = inventarios.find(
  67  |       (i) => i.id_producto === id_producto && i.id_sucursal === id_sucursal
  68  |     );
  69  |     expect(registro.cantidad).toBe(3); // sin cambios
  70  |   });
  71  | 
  72  |   test("TC-036c: una venta con varias líneas de producto descuenta cada una por separado", async ({ request }) => {
  73  |     const id_proveedor = await crearProveedor(request);
  74  |     const idA = await crearProducto(request, id_proveedor, 10);
  75  |     const idB = await crearProducto(request, id_proveedor, 15);
  76  |     const id_sucursal = await crearSucursal(request);
  77  |     await crearInventario(request, { id_producto: idA, id_sucursal, cantidad: 10 });
  78  |     await crearInventario(request, { id_producto: idB, id_sucursal, cantidad: 10 });
  79  |     const cliente = await crearCliente(request);
  80  | 
  81  |     const res = await request.post("api/ventas/create", {
  82  |       data: {
  83  |         id_cliente: cliente.id,
  84  |         id_usuario: null,
  85  |         id_sucursal,
  86  |         detalle_ventas: [
  87  |           { id_producto: idA, cantidad: 4, precio_unitario: 10 },
  88  |           { id_producto: idB, cantidad: 6, precio_unitario: 15 },
  89  |         ],
  90  |       },
  91  |     });
> 92  |     expect(res.status(), `respuesta: ${await res.text()}`).toBe(201);
      |                                                            ^ Error: respuesta: {"message":"Error al registrar la venta."}
  93  |     expect((await res.json()).venta.total).toBe("130.00"); // 4*10 + 6*15
  94  | 
  95  |     const check = await request.get("api/inventario/");
  96  |     const inventarios = await check.json();
  97  |     expect(
  98  |       inventarios.find((i) => i.id_producto === idA && i.id_sucursal === id_sucursal).cantidad
  99  |     ).toBe(6); // 10 - 4
  100 |     expect(
  101 |       inventarios.find((i) => i.id_producto === idB && i.id_sucursal === id_sucursal).cantidad
  102 |     ).toBe(4); // 10 - 6
  103 |   });
  104 | });
  105 | 
```