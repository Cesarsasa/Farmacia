module.exports = app => {
  const auth = require("../controllers/auth.controller.js");
  const router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: Autenticación
   *   description: Endpoints para login de clientes y empleados
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     LoginRequest:
   *       type: object
   *       required:
   *         - correo
   *         - contrasena
   *       properties:
   *         correo:
   *           type: string
   *           format: email
   *           description: Correo electrónico del usuario
   *           example: usuario@ejemplo.com
   *         contrasena:
   *           type: string
   *           format: password
   *           description: Contraseña del usuario
   *           example: miContraseña123
   *     LoginSuccess:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *           example: Login exitoso.
   *         token:
   *           type: string
   *           description: JWT token para autenticación
   *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *         cliente:
   *           type: object
   *           properties:
   *             id:
   *               type: integer
   *             nombre:
   *               type: string
   *             correo:
   *               type: string
   *         empleado:
   *           type: object
   *           properties:
   *             id:
   *               type: integer
   *             nombre:
   *               type: string
   *             correo:
   *               type: string
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *   securitySchemes:
   *     bearerAuth:
   *       type: http
   *       scheme: bearer
   *       bearerFormat: JWT
   */

  /**
   * @swagger
   * /auth/login-cliente:
   *   post:
   *     summary: Iniciar sesión como cliente
   *     tags: [Autenticación]
   *     description: Autentica a un cliente con correo y contraseña
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *           examples:
   *             ejemploCliente:
   *               summary: Ejemplo de login cliente
   *               value:
   *                 correo: cliente@ejemplo.com
   *                 contrasena: password123
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginSuccess'
   *             examples:
   *               success:
   *                 summary: Respuesta exitosa
   *                 value:
   *                   message: "Login exitoso."
   *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                   cliente:
   *                     id: 1
   *                     nombre: "Juan Pérez"
   *                     correo: "cliente@ejemplo.com"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Correo y contraseña son obligatorios."
   *       401:
   *         description: Credenciales inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               usuarioNoEncontrado:
   *                 summary: Cliente no encontrado
   *                 value:
   *                   message: "Cliente no encontrado."
   *               contraseñaIncorrecta:
   *                 summary: Contraseña incorrecta
   *                 value:
   *                   message: "Contraseña incorrecta."
   *       404:
   *         description: Cliente no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/login-cliente", auth.loginCliente);

  /**
   * @swagger
   * /auth/login-empleado:
   *   post:
   *     summary: Iniciar sesión como empleado
   *     tags: [Autenticación]
   *     description: Autentica a un empleado con correo y contraseña
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *           examples:
   *             ejemploEmpleado:
   *               summary: Ejemplo de login empleado
   *               value:
   *                 correo: empleado@empresa.com
   *                 contrasena: password123
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginSuccess'
   *             examples:
   *               success:
   *                 summary: Respuesta exitosa
   *                 value:
   *                   message: "Login exitoso."
   *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                   empleado:
   *                     id: 1
   *                     nombre: "María García"
   *                     correo: "empleado@empresa.com"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Credenciales inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Empleado no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/login-empleado", auth.loginEmpleado);

   router.post("/solicitar-con", auth.solicitarRecuperacion);

  router.post("/restablecer-con", auth.restablecerContrasena);
   router.post("/solicitar-con-cli", auth.solicitarRecuperacioncliente);

  router.post("/restablecer-con-cli", auth.restablecerContrasenacliente);


  app.use("/api/auth", router);
};