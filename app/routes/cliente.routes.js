const authJwt = require("../middleware/verificarToken");

module.exports = app => {
  const clientes = require("../controllers/cliente.controller.js");
  var router = require("express").Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Cliente:
   *       type: object
   *       required:
   *         - nombre
   *         - correo
   *         - contrasena
   *       properties:
   *         id:
   *           type: integer
   *           readOnly: true
   *           description: ID autogenerado del cliente
   *         nombre:
   *           type: string
   *           description: Nombre del cliente
   *           example: Juan Carlos
   *         apellido:
   *           type: string
   *           description: Apellido del cliente
   *           example: Pérez García
   *         nit:
   *           type: string
   *           description: NIT del cliente
   *           example: 1234567-8
   *         correo:
   *           type: string
   *           format: email
   *           description: Correo electrónico del cliente
   *           example: juan.perez@email.com
   *         contrasena:
   *           type: string
   *           format: password
   *           writeOnly: true
   *           description: Contraseña del cliente (se encripta automáticamente)
   *           minLength: 6
   *           example: miPassword123
   *         direccion:
   *           type: string
   *           description: Dirección del cliente
   *           example: 12 Avenida Norte, Ciudad
   *         telefono:
   *           type: string
   *           description: Teléfono del cliente
   *           example: 5555-1234
   *     ClienteResponse:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         nombre:
   *           type: string
   *         apellido:
   *           type: string
   *         nit:
   *           type: string
   *         correo:
   *           type: string
   *         direccion:
   *           type: string
   *         telefono:
   *           type: string
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *   parameters:
   *     idClientePath:
   *       in: path
   *       name: id
   *       required: true
   *       schema:
   *         type: integer
   *       description: ID del cliente
   *     nombreQuery:
   *       in: query
   *       name: nombre
   *       required: false
   *       schema:
   *         type: string
   *       description: Nombre para filtrar clientes (búsqueda parcial)
   */

  /**
   * @swagger
   * tags:
   *   name: Clientes
   *   description: Gestión de clientes del sistema
   */

  /**
   * @swagger
   * /customer/create:
   *   post:
   *     summary: Crear un nuevo cliente
   *     tags: [Clientes]
   *     description: Crea un nuevo cliente en el sistema. La contraseña se encripta automáticamente.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Cliente'
   *           example:
   *             nombre: "María José"
   *             apellido: "López Martínez"
   *             nit: "87654321-9"
   *             correo: "maria.lopez@email.com"
   *             contrasena: "passwordSeguro123"
   *             direccion: "5 Calle Poniente, Ciudad"
   *             telefono: "5555-5678"
   *     responses:
   *       200:
   *         description: Cliente creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ClienteResponse'
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Nombre, correo y contraseña son obligatorios."
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/create/",clientes.create);

  /**
   * @swagger
   * /customer:
   *   get:
   *     summary: Obtener todos los clientes
   *     tags: [Clientes]
   *     description: Retorna la lista de todos los clientes. Se puede filtrar por nombre.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - $ref: '#/components/parameters/nombreQuery'
   *     responses:
   *       200:
   *         description: Lista de clientes obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/ClienteResponse'
   *       401:
   *         description: No autorizado - Token requerido
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/", authJwt.verifyEmpleado, clientes.findAll);

  /**
   * @swagger
   * /customer/{id}:
   *   get:
   *     summary: Obtener un cliente por ID
   *     tags: [Clientes]
   *     description: Retorna la información de un cliente específico
   *     parameters:
   *       - $ref: '#/components/parameters/idClientePath'
   *     responses:
   *       200:
   *         description: Cliente encontrado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ClienteResponse'
   *       404:
   *         description: Cliente no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/:id",clientes.findOne);

    router.get("/buscarnit/:nit",clientes.buscarPorNit);

  /**
   * @swagger
   * /customer/update/{id}:
   *   put:
   *     summary: Actualizar un cliente
   *     tags: [Clientes]
   *     description: Actualiza la información de un cliente existente. La contraseña se encripta automáticamente si se modifica.
   *     parameters:
   *       - $ref: '#/components/parameters/idClientePath'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Cliente'
   *           example:
   *             nombre: "María José"
   *             apellido: "López Hernández"
   *             telefono: "5555-9999"
   *     responses:
   *       200:
   *         description: Cliente actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Cliente actualizado correctamente."
   *       404:
   *         description: Cliente no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "No se pudo actualizar el cliente con id=123."
   *       500:
   *         description: Error interno del servidor
   */
  router.put("/update/:id", authJwt.verifyEmpleado,clientes.update);

  /**
   * @swagger
   * /customer/delete/{id}:
   *   delete:
   *     summary: Eliminar un cliente por ID
   *     tags: [Clientes]
   *     description: Elimina un cliente específico del sistema
   *     parameters:
   *       - $ref: '#/components/parameters/idClientePath'
   *     responses:
   *       200:
   *         description: Cliente eliminado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Cliente eliminado correctamente."
   *       404:
   *         description: Cliente no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "No se encontró el cliente con id=123."
   *       500:
   *         description: Error interno del servidor
   */
  router.delete("/delete/:id", authJwt.verifyEmpleado, clientes.delete);

  /**
   * @swagger
   * /customer/delete:
   *   delete:
   *     summary: Eliminar todos los clientes
   *     tags: [Clientes]
   *     description: Elimina todos los clientes del sistema (operación peligrosa)
   *     responses:
   *       200:
   *         description: Todos los clientes eliminados exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "15 clientes fueron eliminados."
   *       500:
   *         description: Error interno del servidor
   */
  router.delete("/delete/",authJwt.verifyEmpleado, clientes.deleteAll);

  app.use("/api/customer", router);
};