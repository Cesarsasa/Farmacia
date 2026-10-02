const { test, expect } = require("@playwright/test");

/**
 * Módulo: Autenticación - Login Cliente
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a las fichas TC-AUTO-001 y TC-AUTO-002 del informe técnico.
 *
 * Precondición general: debe existir un cliente registrado en la base de datos
 * con el correo y contraseña indicados abajo. Ajusta CLIENTE_CORREO y
 * CLIENTE_CONTRASENA a un cliente real de tu base de datos (o créalo primero
 * llamando a un endpoint de registro de clientes, si tu API lo expone).
 */

const CLIENTE_CORREO = "prueba@gmail.com";
const CLIENTE_CONTRASENA = "123456";

test.describe("Módulo de Autenticación - Login Cliente", () => {

  test("TC-AUTO-001: Login de cliente exitoso con credenciales válidas", async ({ request }) => {
    const res = await request.post("api/auth/login-cliente", {
      data: {
        correo: CLIENTE_CORREO,
        contrasena: CLIENTE_CONTRASENA,
      },
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("Login exitoso.");
    expect(body).toHaveProperty("token");
    expect(body.cliente).toHaveProperty("correo", CLIENTE_CORREO);
  });

  test("TC-AUTO-002: Login de cliente falla con contraseña incorrecta", async ({ request }) => {
    const res = await request.post("api/auth/login-cliente", {
      data: {
        correo: CLIENTE_CORREO,
        contrasena: "contrasenaIncorrecta",
      },
    });

    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.message).toBe("Contraseña incorrecta.");
    expect(body).not.toHaveProperty("token");
  });

});