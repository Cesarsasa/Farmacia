const { test, expect } = require("@playwright/test");
const { crearCliente } = require("../helpers/fixtures");

/**
 * Módulo: Cliente (backend)
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a las filas TC-026, TC-027 y TC-028 del plan de pruebas.
 */

test.describe("Cliente - control de acceso", () => {
  test("TC-026: eliminar un cliente sin token es rechazado (403) y el cliente sigue existiendo", async ({ request }) => {
    const cliente = await crearCliente(request);

    const res = await request.delete(`api/customer/delete/${cliente.id}`);
    expect(res.status()).toBe(403);
    expect((await res.json()).message).toBe("Token no proporcionado o mal formado.");

    // El cliente no debió eliminarse
    const check = await request.get(`api/customer/${cliente.id}`);
    expect(check.status()).toBe(200);
    expect((await check.json()).id).toBe(cliente.id);
  });

  test("TC-026b: eliminar un cliente con un token con formato inválido también es rechazado (403)", async ({ request }) => {
    const cliente = await crearCliente(request);

    const res = await request.delete(`api/customer/delete/${cliente.id}`, {
      headers: { Authorization: "esto-no-es-un-bearer-token" },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe("Cliente - duplicados", () => {
  test("TC-027: crear un cliente con un correo ya registrado es rechazado", async ({ request }) => {
    const existente = await crearCliente(request);

    const res = await request.post("api/customer/create", {
      data: {
        nombre: "Otro",
        apellido: "Cliente",
        nit: "NIT-DISTINTO-001",
        contrasena: "OtraPass123!",
        direccion: "Otra ciudad",
        telefono: "1111-1111",
        correo: existente.correo, // mismo correo
      },
    });

    // Nota: el controlador no valida duplicados manualmente; depende de la
    // restricción UNIQUE de la columna "correo" en la base de datos, por lo
    // que el error llega como 500 (SequelizeUniqueConstraintError), no 400.
    expect(res.status(), `respuesta: ${await res.text()}`).toBe(500);
  });

  test("TC-027b (hallazgo): crear un cliente con un NIT ya registrado SÍ es aceptado hoy", async ({ request }) => {
    // El modelo Cliente (app/models/cliente.model.js) no marca `nit` como
    // unique -- solo `correo` lo es. Esta prueba documenta que, a día de
    // hoy, se pueden crear dos clientes con el mismo NIT. Se deja en verde
    // a propósito para dejar constancia del hallazgo; si se agrega la
    // restricción de unicidad al NIT, este caso debe invertirse (esperar
    // rechazo) y el anterior pasa a ser el comportamiento esperado.
    const existente = await crearCliente(request);

    const res = await request.post("api/customer/create", {
      data: {
        nombre: "Duplicado",
        apellido: "De NIT",
        nit: existente.nit,
        contrasena: "OtraPass123!",
        direccion: "Otra ciudad",
        telefono: "2222-2222",
        correo: `qa-nit-dup-${Date.now()}@ejemplo.com`,
      },
    });

    expect(res.status(), `respuesta: ${await res.text()}`).toBe(200);
    expect((await res.json()).nit).toBe(existente.nit);
  });
});

test.describe("Cliente - actualizar inexistente", () => {
  test("TC-028 (hallazgo): actualizar un cliente inexistente NO responde 404, responde 200 con un mensaje", async ({ request }) => {
    // Comportamiento ideal/esperado: 404 "Cliente no encontrado".
    // Comportamiento real de cliente.controller.js -> update(): como
    // Cliente.update() resuelve con 0 filas afectadas y el controlador solo
    // compara `num == 1`, cualquier otro caso (incluido "no existe") cae en
    // el mismo res.send() con status 200 por defecto.
    const idInexistente = 999999999;

    const res = await request.put(`api/customer/update/${idInexistente}`, {
      data: { nombre: "No debería aplicar" },
    });

    expect(res.status(), `respuesta: ${await res.text()}`).toBe(200);
    expect((await res.json()).message).toBe(
      `No se pudo actualizar el cliente con id=${idInexistente}.`
    );
  });

  test("TC-028b: actualizar un cliente existente sí aplica los cambios (200)", async ({ request }) => {
    const cliente = await crearCliente(request);

    const res = await request.put(`api/customer/update/${cliente.id}`, {
      data: { telefono: "9999-0000" },
    });

    expect(res.status()).toBe(200);
    expect((await res.json()).message).toBe("Cliente actualizado correctamente.");

    const check = await request.get(`api/customer/${cliente.id}`);
    expect((await check.json()).telefono).toBe("9999-0000");
  });
});
