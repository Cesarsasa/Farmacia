const { test, expect } = require("@playwright/test");

test.describe("Módulo de Autenticación - Login Empleado", () => {

  test("TC-AUTO-001: Login exitoso con credenciales válidas", async ({ request }) => {
    const res = await request.post("api/auth/login-empleado", {
      data: {
        correo: "ingeniero@gmail.com",
        contrasena: "123456",
      },
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("Login exitoso.");
    expect(body).toHaveProperty("token");
    expect(body.empleado).toHaveProperty("correo", "ingeniero@gmail.com");
  });

  test("TC-AUTO-002: Login fallido con contraseña incorrecta", async ({ request }) => {
    const res = await request.post("api/auth/login-empleado", {
      data: {
        correo: "ingeniero@gmail.com",
        contrasena: "contrasenaIncorrecta",
      },
    });

    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.message).toBe("Contraseña incorrecta.");
  });

  test("TC-AUTO-003: Login fallido con correo no registrado", async ({ request }) => {
    const res = await request.post("api/auth/login-empleado", {
      data: {
        correo: "noexiste@empresa.com",
        contrasena: "password123",
      },
    });

    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.message).toBe("Empleado no encontrado.");
  });

  test("TC-AUTO-004: Login fallido sin enviar campos obligatorios", async ({ request }) => {
    const res = await request.post("/auth/login-empleado", {
      data: {},
    });

    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.message).toBe("Correo y contraseña son obligatorios.");
  });

});