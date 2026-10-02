# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: carrito\Carrito.gestion.spec.js >> Carrito - gestión de ítems >> TC-016: actualizar la cantidad a un valor negativo es rechazado (400)
- Location: tests\carrito\Carrito.gestion.spec.js:39:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | const {
  3  |   crearEscenario,
  4  |   crearProducto,
  5  |   crearCliente,
  6  |   agregarAlCarrito,
  7  |   verCarrito,
  8  | } = require("../helpers/fixtures");
  9  | 
  10 | /**
  11 |  * Módulo: Carrito de compras - gestión de ítems
  12 |  * Herramienta: Playwright (pruebas de API)
  13 |  * Corresponde a las filas TC-015, TC-016 y TC-017 del plan de pruebas.
  14 |  *
  15 |  * Cada prueba crea sus propios datos (cliente, producto, etc.) vía la API,
  16 |  * así no depende de datos sembrados ni de otras pruebas.
  17 |  *
  18 |  * NOTA (caso ideal vs. comportamiento actual):
  19 |  * TC-015 y TC-016 describen la regla de negocio esperada. Hoy
  20 |  * carrito.controller.js -> actualizarCantidad() guarda cualquier valor
  21 |  * sin validarlo, por lo que estas dos pruebas FALLAN hasta que se agregue
  22 |  * la validación (ver parche sugerido en la respuesta).
  23 |  */
  24 | 
  25 | test.describe("Carrito - gestión de ítems", () => {
  26 |   test("TC-015: actualizar la cantidad a 0 elimina el ítem del carrito", async ({ request }) => {
  27 |     const e = await crearEscenario(request);
  28 |     await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });
  29 | 
  30 |     const res = await request.put("api/carrito/actualizar", {
  31 |       data: { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 0 },
  32 |     });
  33 |     expect(res.status()).toBe(200);
  34 | 
  35 |     const carrito = await verCarrito(request, e.id_cliente);
  36 |     expect(carrito).toHaveLength(0); // el ítem ya no debe existir
  37 |   });
  38 | 
  39 |   test("TC-016: actualizar la cantidad a un valor negativo es rechazado (400)", async ({ request }) => {
  40 |     const e = await crearEscenario(request);
  41 |     await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });
  42 | 
  43 |     const res = await request.put("api/carrito/actualizar", {
  44 |       data: { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: -3 },
  45 |     });
> 46 |     expect(res.status()).toBe(400);
     |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  47 | 
  48 |     // La cantidad original no debe haberse modificado
  49 |     const carrito = await verCarrito(request, e.id_cliente);
  50 |     expect(carrito).toHaveLength(1);
  51 |     expect(carrito[0].cantidad).toBe(2);
  52 |   });
  53 | 
  54 |   test("TC-017: vaciar el carrito elimina todos los ítems del cliente (y solo los suyos)", async ({ request }) => {
  55 |     const e = await crearEscenario(request);
  56 |     const idProducto2 = await crearProducto(request, e.id_proveedor, 40);
  57 |     await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 1 });
  58 |     await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: idProducto2, cantidad: 3 });
  59 | 
  60 |     // Otro cliente con un ítem propio: NO debe verse afectado
  61 |     const otro = await crearCliente(request);
  62 |     await agregarAlCarrito(request, { id_cliente: otro.id, id_producto: e.id_producto, cantidad: 1 });
  63 | 
  64 |     expect(await verCarrito(request, e.id_cliente)).toHaveLength(2);
  65 | 
  66 |     const res = await request.delete(`api/carrito/vaciar/${e.id_cliente}`);
  67 |     expect(res.status()).toBe(200);
  68 |     expect((await res.json()).message).toBe("Carrito vaciado.");
  69 | 
  70 |     expect(await verCarrito(request, e.id_cliente)).toHaveLength(0);
  71 |     expect(await verCarrito(request, otro.id)).toHaveLength(1);
  72 | 
  73 |     // Limpieza del carrito del segundo cliente
  74 |     await request.delete(`api/carrito/vaciar/${otro.id}`);
  75 |   });
  76 | });
  77 | 
```