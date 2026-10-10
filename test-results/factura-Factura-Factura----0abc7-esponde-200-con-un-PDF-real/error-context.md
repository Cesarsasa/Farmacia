# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: factura\Factura.spec.js >> Factura - generación de PDF >> TC-031: generar el PDF de una factura válida responde 200 con un PDF real
- Location: tests\factura\Factura.spec.js:20:3

# Error details

```
Error: crear venta falló (500): {"message":"Error al registrar la venta."}

expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 500
```

# Test source

```ts
  26  |   const s = sufijo();
  27  |   const body = await crearYValidar(request, "api/prov/create", {
  28  |     nombre: `QA Proveedor ${s}`,
  29  |     contacto: "QA Automation",
  30  |     telefono: "0000-0000",
  31  |     correo: `qa-prov-${s}@ejemplo.com`,
  32  |   });
  33  |   return body.id;
  34  | }
  35  | 
  36  | async function crearProducto(request, idProveedor, precio = 25) {
  37  |   const s = sufijo();
  38  |   const body = await crearYValidar(
  39  |     request,
  40  |     "api/producto/create",
  41  |     {
  42  |       nombre: `QA Producto ${s}`,
  43  |       descripcion: "Producto creado por pruebas automatizadas",
  44  |       precio_unitario: precio,
  45  |       id_proveedor: idProveedor,
  46  |     },
  47  |     201
  48  |   );
  49  |   return body.id;
  50  | }
  51  | 
  52  | async function crearSucursal(request) {
  53  |   const s = sufijo();
  54  |   const body = await crearYValidar(
  55  |     request,
  56  |     "api/sucursal/create",
  57  |     { nombre: `QA Sucursal ${s}`, direccion: "Zona 1", telefono: "0000-0000" },
  58  |     201
  59  |   );
  60  |   return body.id;
  61  | }
  62  | 
  63  | async function crearInventario(request, { id_producto, id_sucursal, cantidad }) {
  64  |   const body = await crearYValidar(
  65  |     request,
  66  |     "api/inventario/create",
  67  |     { cantidad, id_producto, id_sucursal },
  68  |     201
  69  |   );
  70  |   return body.data.id;
  71  | }
  72  | 
  73  | async function crearCliente(request, overrides = {}) {
  74  |   const s = sufijo();
  75  |   const body = await crearYValidar(request, "api/customer/create", {
  76  |     nombre: "QA",
  77  |     apellido: "Cliente",
  78  |     nit: `QA${s}`.slice(0, 20),
  79  |     contrasena: "QaPass123!",
  80  |     direccion: "Ciudad",
  81  |     telefono: "0000-0000",
  82  |     correo: `qa-cli-${s}@ejemplo.com`,
  83  |     ...overrides,
  84  |   });
  85  |   return { id: body.id, correo: body.correo, nit: body.nit };
  86  | }
  87  | 
  88  | async function crearEscenario(request, { stock = 10, precio = 25 } = {}) {
  89  |   const id_proveedor = await crearProveedor(request);
  90  |   const id_producto = await crearProducto(request, id_proveedor, precio);
  91  |   const id_sucursal = await crearSucursal(request);
  92  |   const id_inventario = await crearInventario(request, { id_producto, id_sucursal, cantidad: stock });
  93  |   const cliente = await crearCliente(request);
  94  |   return { id_proveedor, id_producto, id_sucursal, id_inventario, id_cliente: cliente.id, correo: cliente.correo, precio };
  95  | }
  96  | 
  97  | async function agregarAlCarrito(request, { id_cliente, id_producto, cantidad }) {
  98  |   const res = await request.post("api/carrito/agregar", { data: { id_cliente, id_producto, cantidad } });
  99  |   expect(res.status(), `agregar al carrito falló: ${await res.text()}`).toBe(201);
  100 |   return res.json();
  101 | }
  102 | 
  103 | async function verCarrito(request, id_cliente) {
  104 |   const res = await request.get(`api/carrito/ver/${id_cliente}`);
  105 |   expect(res.status()).toBe(200);
  106 |   return res.json();
  107 | }
  108 | 
  109 | async function stockActual(request, id_inventario) {
  110 |   const res = await request.get(`api/inventario/${id_inventario}`);
  111 |   expect(res.status()).toBe(200);
  112 |   return (await res.json()).cantidad;
  113 | }
  114 | 
  115 | async function ventasDeCliente(request, id_cliente) {
  116 |   const res = await request.get("api/ventas");
  117 |   expect(res.status()).toBe(200);
  118 |   const ventas = await res.json();
  119 |   return ventas.filter((v) => v.id_cliente === id_cliente);
  120 | }
  121 | 
  122 | async function crearVenta(request, { id_cliente, id_usuario = null, id_sucursal, detalle_ventas }) {
  123 |   const res = await request.post("api/ventas/create", {
  124 |     data: { id_cliente, id_usuario, id_sucursal, detalle_ventas },
  125 |   });
> 126 |   expect(res.status(), `crear venta falló (${res.status()}): ${await res.text()}`).toBe(201);
      |                                                                                    ^ Error: crear venta falló (500): {"message":"Error al registrar la venta."}
  127 |   return (await res.json()).venta;
  128 | }
  129 | 
  130 | async function crearVentaCompleta(request, { cantidad = 2, precio = 25 } = {}) {
  131 |   const id_proveedor = await crearProveedor(request);
  132 |   const id_producto = await crearProducto(request, id_proveedor, precio);
  133 |   const id_sucursal = await crearSucursal(request);
  134 |   await crearInventario(request, { id_producto, id_sucursal, cantidad: cantidad + 5 });
  135 |   const cliente = await crearCliente(request);
  136 | 
  137 |   const venta = await crearVenta(request, {
  138 |     id_cliente: cliente.id,
  139 |     id_sucursal,
  140 |     detalle_ventas: [{ id_producto, cantidad, precio_unitario: precio }],
  141 |   });
  142 | 
  143 |   return {
  144 |     id_venta: venta.id,
  145 |     id_cliente: cliente.id,
  146 |     correo: cliente.correo,
  147 |     id_producto,
  148 |     id_sucursal,
  149 |     total: cantidad * precio,
  150 |   };
  151 | }
  152 | 
  153 | async function crearFactura(request, id_venta) {
  154 |   const res = await request.post("api/facturas/create", { data: { id_venta } });
  155 |   expect(res.status(), `crear factura falló: ${await res.text()}`).toBe(201);
  156 |   return (await res.json()).factura;
  157 | }
  158 | 
  159 | module.exports = {
  160 |   crearProveedor,
  161 |   crearProducto,
  162 |   crearSucursal,
  163 |   crearInventario,
  164 |   crearCliente,
  165 |   crearEscenario,
  166 |   agregarAlCarrito,
  167 |   verCarrito,
  168 |   stockActual,
  169 |   ventasDeCliente,
  170 |   crearVenta,
  171 |   crearVentaCompleta,
  172 |   crearFactura,
  173 | };
```