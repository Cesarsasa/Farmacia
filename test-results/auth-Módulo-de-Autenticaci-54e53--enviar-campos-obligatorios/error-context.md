# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Módulo de Autenticación - Login Empleado >> TC-AUTO-004: Login fallido sin enviar campos obligatorios
- Location: tests\auth.spec.js:49:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 404
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | 
  3  | test.describe("Módulo de Autenticación - Login Empleado", () => {
  4  | 
  5  |   test("TC-AUTO-001: Login exitoso con credenciales válidas", async ({ request }) => {
  6  |     const res = await request.post("api/auth/login-empleado", {
  7  |       data: {
  8  |         correo: "ingeniero@gmail.com",
  9  |         contrasena: "123456",
  10 |       },
  11 |     });
  12 | 
  13 |     expect(res.status()).toBe(200);
  14 | 
  15 |     const body = await res.json();
  16 |     expect(body.message).toBe("Login exitoso.");
  17 |     expect(body).toHaveProperty("token");
  18 |     expect(body.empleado).toHaveProperty("correo", "ingeniero@gmail.com");
  19 |   });
  20 | 
  21 |   test("TC-AUTO-002: Login fallido con contraseña incorrecta", async ({ request }) => {
  22 |     const res = await request.post("api/auth/login-empleado", {
  23 |       data: {
  24 |         correo: "ingeniero@gmail.com",
  25 |         contrasena: "contrasenaIncorrecta",
  26 |       },
  27 |     });
  28 | 
  29 |     expect(res.status()).toBe(401);
  30 | 
  31 |     const body = await res.json();
  32 |     expect(body.message).toBe("Contraseña incorrecta.");
  33 |   });
  34 | 
  35 |   test("TC-AUTO-003: Login fallido con correo no registrado", async ({ request }) => {
  36 |     const res = await request.post("api/auth/login-empleado", {
  37 |       data: {
  38 |         correo: "noexiste@empresa.com",
  39 |         contrasena: "password123",
  40 |       },
  41 |     });
  42 | 
  43 |     expect(res.status()).toBe(404);
  44 | 
  45 |     const body = await res.json();
  46 |     expect(body.message).toBe("Empleado no encontrado.");
  47 |   });
  48 | 
  49 |   test("TC-AUTO-004: Login fallido sin enviar campos obligatorios", async ({ request }) => {
  50 |     const res = await request.post("/auth/login-empleado", {
  51 |       data: {},
  52 |     });
  53 | 
> 54 |     expect(res.status()).toBe(400);
     |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  55 | 
  56 |     const body = await res.json();
  57 |     expect(body.message).toBe("Correo y contraseña son obligatorios.");
  58 |   });
  59 | 
  60 | });
```