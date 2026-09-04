const request = require("supertest");
const app = require("../app");
const db = require("../app/models"); // ← ajusta la ruta según donde esté la carpeta models

beforeAll(async () => {
inti  await db.sequelize.sync(); // ← espera que termine el sync ANTES de los tests
}, 30000); // 30 segundos de timeout para el sync

describe("Módulo de Autenticación - Login Empleado", () => {

  afterAll(async () => {
    await db.sequelize.close(); // ← usa db.sequelize porque así lo exporta tu models/index.js
  });

  it("TC-AUTO-001: Login exitoso con credenciales válidas", async () => {
    const res = await request(app)
      .post("/api/auth/login-empleado")
      .send({ correo: "ingeniero@gmail.com", contrasena: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login exitoso.");
    expect(res.body).toHaveProperty("token");
  });

  it("TC-AUTO-002: Login fallido con contraseña incorrecta", async () => {
    const res = await request(app)
      .post("/api/auth/login-empleado")
      .send({ correo: "ingeniero@gmail.com", contrasena: "contrasenaIncorrecta" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Contraseña incorrecta.");
  });

  it("TC-AUTO-003: Login fallido con correo no registrado", async () => {
    const res = await request(app)
      .post("/api/auth/login-empleado")
      .send({ correo: "noexiste@empresa.com", contrasena: "password123" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Empleado no encontrado.");
  });

  it("TC-AUTO-004: Login fallido sin enviar campos obligatorios", async () => {
    const res = await request(app)
      .post("/api/auth/login-empleado")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Correo y contraseña son obligatorios.");
  });

});