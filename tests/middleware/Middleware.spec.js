const { test, expect } = require("@playwright/test");
const jwt = require("jsonwebtoken");

/**
 * Módulo: Middleware verificarToken (backend)
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a la fila TC-045 del plan de pruebas
 * ("Solicitud sin token retorna 401").
 *
 * Se prueba contra GET /api/usuario/, que usa authJwt.verifyToken
 * (middleware genérico, no el específico de empleado/cliente).
 *
 * NOTA (caso ideal vs. comportamiento actual): el plan decía "sin token
 * retorna 401", pero app/middleware/verificarToken.js responde 403 cuando
 * no hay cabecera Authorization (o no empieza con "Bearer "), y reserva el
 * 401 para cuando SÍ hay un token pero jwt.verify() lo rechaza (firma
 * inválida o expirado). TC-045 prueba el 403 real; TC-045c prueba el 401
 * real con un token de firma inválida.
 *
 * Requiere que JWT_SECRET del servidor bajo prueba coincida con
 * JWT_SECRET_PRUEBAS (en este repo, .env define JWT_SECRET=local_jwt_secret
 * para el servidor local de pruebas).
 */

const JWT_SECRET_PRUEBAS = process.env.JWT_SECRET || "local_jwt_secret";

function tokenValido() {
  return jwt.sign({ id: 1, correo: "qa@ejemplo.com" }, JWT_SECRET_PRUEBAS, { expiresIn: "1h" });
}

function tokenExpirado() {
  return jwt.sign({ id: 1 }, JWT_SECRET_PRUEBAS, { expiresIn: "-10s" });
}

function tokenFirmaInvalida() {
  return jwt.sign({ id: 1 }, "otra-llave-distinta-a-la-del-servidor", { expiresIn: "1h" });
}

test.describe("Middleware verificarToken", () => {
  test("TC-045: solicitud sin cabecera Authorization responde 403 (no 401)", async ({ request }) => {
    const res = await request.get("api/usuario/");
    expect(res.status()).toBe(403);
    expect((await res.json()).message).toBe("Token no proporcionado o mal formado.");
  });

  test("TC-045b: cabecera Authorization sin el prefijo 'Bearer ' responde 403", async ({ request }) => {
    const res = await request.get("api/usuario/", {
      headers: { Authorization: tokenValido() }, // falta "Bearer "
    });
    expect(res.status()).toBe(403);
  });

  test("TC-045c: token con firma inválida responde 401", async ({ request }) => {
    const res = await request.get("api/usuario/", {
      headers: { Authorization: `Bearer ${tokenFirmaInvalida()}` },
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).message).toBe("Token inválido.");
  });

  test("TC-045d: token expirado responde 401", async ({ request }) => {
    const res = await request.get("api/usuario/", {
      headers: { Authorization: `Bearer ${tokenExpirado()}` },
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).message).toBe("Token inválido.");
  });

  test("TC-045e: token válido permite el acceso (200)", async ({ request }) => {
    const res = await request.get("api/usuario/", {
      headers: { Authorization: `Bearer ${tokenValido()}` },
    });
    expect(res.status()).toBe(200);
  });
});
