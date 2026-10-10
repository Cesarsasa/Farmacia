const { test, expect } = require("@playwright/test");
const {
  crearVentaCompleta,
  crearFactura,
  crearCliente,
  crearVenta,
  crearProveedor,
  crearProducto,
  crearSucursal,
  crearInventario,
} = require("../helpers/fixtures");

/**
 * Módulo: Factura (backend)
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a las filas TC-031, TC-032 y TC-034 del plan de pruebas.
 */

test.describe("Factura - generación de PDF", () => {
  test("TC-031: generar el PDF de una factura válida responde 200 con un PDF real", async ({ request }) => {
    const venta = await crearVentaCompleta(request, { cantidad: 2, precio: 25 });
    const factura = await crearFactura(request, venta.id_venta);

    const res = await request.get(`api/facturas/pdf/${factura.id}`);

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");

    const buffer = await res.body();
    // Todo PDF válido empieza con la cabecera "%PDF-"
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(500);
  });

  test("TC-031b: generar el PDF de una factura inexistente responde 404 (no un PDF)", async ({ request }) => {
    const res = await request.get("api/facturas/pdf/999999999");
    expect(res.status()).toBe(404);
    expect((await res.json()).message).toBe("Factura no encontrada.");
  });
});

test.describe("Factura - envío por correo", () => {
  test("TC-032: enviar por correo una factura cuyo cliente no tiene correo registrado es rechazado (400)", async ({ request }) => {
    // Caso alcanzable sin depender de un proveedor de correo real: se crea
    // un cliente normal (el create exige correo) y luego se le quita el
    // correo con un update, para que el controlador tenga que cortar antes
    // de intentar enviar nada.
    const cliente = await crearCliente(request);
    const quitarCorreo = await request.put(`api/customer/update/${cliente.id}`, {
      data: { correo: null },
    });
    expect(quitarCorreo.status()).toBe(200);

    const id_proveedor = await crearProveedor(request);
    const id_producto = await crearProducto(request, id_proveedor, 25);
    const id_sucursal = await crearSucursal(request);
    await crearInventario(request, { id_producto, id_sucursal, cantidad: 10 });

    const venta = await crearVenta(request, {
      id_cliente: cliente.id,
      id_sucursal,
      detalle_ventas: [{ id_producto, cantidad: 2, precio_unitario: 25 }],
    });
    const factura = await crearFactura(request, venta.id);

    const res = await request.get(`api/facturas/correo/${factura.id}`);
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(400);
    expect((await res.json()).message).toBe("El cliente no tiene correo registrado.");
  });

  test("TC-032b: enviar por correo una factura inexistente responde 404", async ({ request }) => {
    const res = await request.get("api/facturas/correo/999999999");
    expect(res.status()).toBe(404);
    expect((await res.json()).message).toBe("Factura no encontrada.");
  });

  // TC-032c (manual / fuera de este entorno): con un cliente que sí tiene
  // correo y una RESEND_API_KEY válida, GET /api/facturas/correo/:id debe
  // responder 200 "Factura enviada correctamente al correo del cliente.".
  // No se automatiza aquí porque requiere salida de red real hacia la API
  // de Resend (bloqueada en este entorno de pruebas) y una llave de API
  // real; se recomienda cubrirlo con un mock de `resend` a nivel de
  // controlador (Jest + jest.mock("resend")) en vez de Playwright.
});

test.describe("Factura - consulta por id", () => {
  // NOTA (caso ideal vs. comportamiento actual): factura.controller.js ->
  // findOne() hace `Factura.findByPk(id, { include: [{ model: Venta }] })`,
  // pero la asociación real está definida con alias:
  // `db.facturas.belongsTo(db.ventas, { foreignKey: 'id_venta', as: 'venta' })`
  // (ver app/models/index.js). Al no pasar `as: 'venta'`, Sequelize no
  // encuentra la asociación y lanza un error ANTES de llegar a la base de
  // datos, así que el endpoint responde 500 para CUALQUIER id, exista o no
  // la factura. TC-034 y TC-034b documentan ese comportamiento actual.
  test("TC-034: consultar una factura inexistente responde 500 en vez de 404 (endpoint roto)", async ({ request }) => {
    const res = await request.get("api/facturas/999999999");
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(500);
    expect((await res.json()).message).toBe(
      "Error al recuperar la factura con id=999999999"
    );
  });

  test("TC-034b (hallazgo): consultar una factura EXISTENTE también responde 500, por el mismo bug", async ({ request }) => {
    const venta = await crearVentaCompleta(request);
    const factura = await crearFactura(request, venta.id_venta);

    const res = await request.get(`api/facturas/${factura.id}`);
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(500);
    // Comportamiento ideal, una vez corregido el alias: 200 con
    // body.id === factura.id y body.numero_factura === factura.numero_factura.
  });
});
