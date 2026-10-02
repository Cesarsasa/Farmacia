const { test, expect } = require("@playwright/test");

/**
 * Módulo: Productos
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a las fichas TC-AUTO-003 y TC-AUTO-004 del informe técnico.
 *
 * beforeAll crea un proveedor real vía la API (POST /api/prov/create) para
 * obtener un id_proveedor válido y evitar depender de datos ya sembrados
 * en la base de datos.
 */

test.describe("Módulo de Productos", () => {
  let idProveedor;

  test.beforeAll(async ({ request }) => {
    const res = await request.post("api/prov/create", {
      data: {
        nombre: "Proveedor de Prueba QA",
        contacto: "QA Automation",
        telefono: "0000-0000",
        correo: "qa-proveedor@ejemplo.com",
      },
    });
    const body = await res.json();
    idProveedor = body.id;
  });

  test("TC-AUTO-003: Creación de un producto con datos válidos", async ({ request }) => {
    const res = await request.post("api/producto/create", {
      data: {
        nombre: "Ibuprofeno",
        descripcion: "Antiinflamatorio de uso general",
        precio_unitario: 12.5,
        id_proveedor: idProveedor,
      },
    });

    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.nombre).toBe("Ibuprofeno");
    expect(body).toHaveProperty("id");
    expect(typeof body.id).toBe("number");
  });

  test("TC-AUTO-004: Listado de productos filtrando por nombre", async ({ request }) => {
    // Se crea primero un producto "Aspirina" para asegurar que el filtro tenga
    // al menos una coincidencia, sin depender de datos previos en la BD.
    await request.post("api/producto/create", {
      data: {
        nombre: "Aspirina",
        descripcion: "Analgésico y antipirético",
        precio_unitario: 7.99,
        id_proveedor: idProveedor,
      },
    });

    const res = await request.get("api/producto?nombre=Aspirina");

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const producto of body) {
      expect(producto.nombre.toLowerCase()).toContain("aspirina");
    }
  });

});