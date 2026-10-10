const { expect } = require("@playwright/test");

/**
 * Helpers para preparar datos de prueba vía la API real (sin tocar la BD
 * directamente). Cada llamada usa un sufijo único para evitar colisiones
 * (correo de cliente es UNIQUE) cuando Playwright corre archivos en paralelo.
 *
 * Nota: los registros creados llevan el prefijo "QA" para poder
 * identificarlos y limpiarlos de la BD de pruebas.
 */

function sufijo() {
  return `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
}

async function crearYValidar(request, url, data, statusEsperado) {
  const res = await request.post(url, { data });
  expect(
    statusEsperado ? res.status() : res.ok(),
    `POST ${url} falló (${res.status()}): ${await res.text()}`
  ).toBe(statusEsperado ?? true);
  return res.json();
}

async function crearProveedor(request) {
  const s = sufijo();
  const body = await crearYValidar(request, "api/prov/create", {
    nombre: `QA Proveedor ${s}`,
    contacto: "QA Automation",
    telefono: "0000-0000",
    correo: `qa-prov-${s}@ejemplo.com`,
  });
  return body.id;
}

async function crearProducto(request, idProveedor, precio = 25) {
  const s = sufijo();
  const body = await crearYValidar(
    request,
    "api/producto/create",
    {
      nombre: `QA Producto ${s}`,
      descripcion: "Producto creado por pruebas automatizadas",
      precio_unitario: precio,
      id_proveedor: idProveedor,
    },
    201
  );
  return body.id;
}

async function crearSucursal(request) {
  const s = sufijo();
  const body = await crearYValidar(
    request,
    "api/sucursal/create",
    { nombre: `QA Sucursal ${s}`, direccion: "Zona 1", telefono: "0000-0000" },
    201
  );
  return body.id;
}

async function crearInventario(request, { id_producto, id_sucursal, cantidad }) {
  const body = await crearYValidar(
    request,
    "api/inventario/create",
    { cantidad, id_producto, id_sucursal },
    201
  );
  return body.data.id;
}

async function crearCliente(request, overrides = {}) {
  const s = sufijo();
  const body = await crearYValidar(request, "api/customer/create", {
    nombre: "QA",
    apellido: "Cliente",
    nit: `QA${s}`.slice(0, 20),
    contrasena: "QaPass123!",
    direccion: "Ciudad",
    telefono: "0000-0000",
    correo: `qa-cli-${s}@ejemplo.com`,
    ...overrides,
  });
  return { id: body.id, correo: body.correo, nit: body.nit };
}

async function crearEscenario(request, { stock = 10, precio = 25 } = {}) {
  const id_proveedor = await crearProveedor(request);
  const id_producto = await crearProducto(request, id_proveedor, precio);
  const id_sucursal = await crearSucursal(request);
  const id_inventario = await crearInventario(request, { id_producto, id_sucursal, cantidad: stock });
  const cliente = await crearCliente(request);
  return { id_proveedor, id_producto, id_sucursal, id_inventario, id_cliente: cliente.id, correo: cliente.correo, precio };
}

async function agregarAlCarrito(request, { id_cliente, id_producto, cantidad }) {
  const res = await request.post("api/carrito/agregar", { data: { id_cliente, id_producto, cantidad } });
  expect(res.status(), `agregar al carrito falló: ${await res.text()}`).toBe(201);
  return res.json();
}

async function verCarrito(request, id_cliente) {
  const res = await request.get(`api/carrito/ver/${id_cliente}`);
  expect(res.status()).toBe(200);
  return res.json();
}

async function stockActual(request, id_inventario) {
  const res = await request.get(`api/inventario/${id_inventario}`);
  expect(res.status()).toBe(200);
  return (await res.json()).cantidad;
}

async function ventasDeCliente(request, id_cliente) {
  const res = await request.get("api/ventas");
  expect(res.status()).toBe(200);
  const ventas = await res.json();
  return ventas.filter((v) => v.id_cliente === id_cliente);
}

async function crearVenta(request, { id_cliente, id_usuario = null, id_sucursal, detalle_ventas }) {
  const res = await request.post("api/ventas/create", {
    data: { id_cliente, id_usuario, id_sucursal, detalle_ventas },
  });
  expect(res.status(), `crear venta falló (${res.status()}): ${await res.text()}`).toBe(201);
  return (await res.json()).venta;
}

async function crearVentaCompleta(request, { cantidad = 2, precio = 25 } = {}) {
  const id_proveedor = await crearProveedor(request);
  const id_producto = await crearProducto(request, id_proveedor, precio);
  const id_sucursal = await crearSucursal(request);
  await crearInventario(request, { id_producto, id_sucursal, cantidad: cantidad + 5 });
  const cliente = await crearCliente(request);

  const venta = await crearVenta(request, {
    id_cliente: cliente.id,
    id_sucursal,
    detalle_ventas: [{ id_producto, cantidad, precio_unitario: precio }],
  });

  return {
    id_venta: venta.id,
    id_cliente: cliente.id,
    correo: cliente.correo,
    id_producto,
    id_sucursal,
    total: cantidad * precio,
  };
}

async function crearFactura(request, id_venta) {
  const res = await request.post("api/facturas/create", { data: { id_venta } });
  expect(res.status(), `crear factura falló: ${await res.text()}`).toBe(201);
  return (await res.json()).factura;
}

module.exports = {
  crearProveedor,
  crearProducto,
  crearSucursal,
  crearInventario,
  crearCliente,
  crearEscenario,
  agregarAlCarrito,
  verCarrito,
  stockActual,
  ventasDeCliente,
  crearVenta,
  crearVentaCompleta,
  crearFactura,
};