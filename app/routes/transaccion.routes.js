module.exports = app => {
  const transaccion = require("../controllers/transaccion.controller.js");
  const router = require("express").Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Transaccion:
   *       type: object
   *       required:
   *         - id_factura
   *         - metodo_pago
   *         - monto
   *         - estado
   *       properties:
   *         id:
   *           type: integer
   *           readOnly: true
   *           description: ID autogenerado de la transacción
   *         id_factura:
   *           type: integer
   *           description: ID de la factura asociada
   *           example: 1
   *         metodo_pago:
   *           type: string
   *           enum: [efectivo, tarjeta_credito, tarjeta_debito, transferencia]
   *           description: Método de pago utilizado
   *           example: "tarjeta_credito"
   *         monto:
   *           type: number
   *           format: float
   *           minimum: 0
   *           description: Monto de la transacción
   *           example: 1500.75
   *         estado:
   *           type: string
   *           enum: [pendiente, completada, fallida, reembolsada]
   *           description: Estado actual de la transacción
   *           example: "completada"
   *         fecha:
   *           type: string
   *           format: date-time
   *           readOnly: true
   *           description: Fecha y hora de la transacción
   *         factura:
   *           $ref: '#/components/schemas/Factura'
   *     TransaccionCreate:
   *       type: object
   *       required:
   *         - id_factura
   *         - metodo_pago
   *         - monto
   *         - estado
   *       properties:
   *         id_factura:
   *           type: integer
   *           example: 1
   *         metodo_pago:
   *           type: string
   *           example: "efectivo"
   *         monto:
   *           type: number
   *           example: 2500.50
   *         estado:
   *           type: string
   *           example: "completada"
   *     Factura:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         numero_factura:
   *           type: string
   *         fecha_emision:
   *           type: string
   *           format: date-time
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *   parameters:
   *     transaccionIdPath:
   *       in: path
   *       name: id
   *       required: true
   *       schema:
   *         type: integer
   *       description: ID de la transacción
   */

  /**
   * @swagger
   * tags:
   *   name: Transacciones
   *   description: Gestión de transacciones de pago del sistema
   */

  /**
   * @swagger
   * /transacciones/create:
   *   post:
   *     summary: Crear una nueva transacción
   *     tags: [Transacciones]
   *     description: Registra una nueva transacción de pago asociada a una factura
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TransaccionCreate'
   *           example:
   *             id_factura: 5
   *             metodo_pago: "tarjeta_credito"
   *             monto: 1800.25
   *             estado: "completada"
   *     responses:
   *       201:
   *         description: Transacción creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 transaccion:
   *                   $ref: '#/components/schemas/Transaccion'
   *             example:
   *               message: "Transacción registrada correctamente."
   *               transaccion:
   *                 id: 1
   *                 id_factura: 5
   *                 metodo_pago: "tarjeta_credito"
   *                 monto: 1800.25
   *                 estado: "completada"
   *                 fecha: "2023-12-20T14:30:00.000Z"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Todos los campos son obligatorios."
   *       404:
   *         description: Factura no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   */
  router.post("/create", transaccion.create);

  /**
   * @swagger
   * /transacciones:
   *   get:
   *     summary: Obtener todas las transacciones
   *     tags: [Transacciones]
   *     description: Retorna la lista de todas las transacciones ordenadas por fecha descendente
   *     responses:
   *       200:
   *         description: Lista de transacciones obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Transaccion'
   *             example:
   *               - id: 1
   *                 id_factura: 5
   *                 metodo_pago: "tarjeta_credito"
   *                 monto: 1800.25
   *                 estado: "completada"
   *                 fecha: "2023-12-20T14:30:00.000Z"
   *                 factura:
   *                   id: 5
   *                   numero_factura: "F-1703052800000"
   *                   fecha_emision: "2023-12-20T10:30:00.000Z"
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/", transaccion.findAll);

  /**
   * @swagger
   * /transacciones/{id}:
   *   get:
   *     summary: Obtener una transacción por ID
   *     tags: [Transacciones]
   *     description: Retorna la información completa de una transacción específica incluyendo datos de la factura
   *     parameters:
   *       - $ref: '#/components/parameters/transaccionIdPath'
   *     responses:
   *       200:
   *         description: Transacción encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Transaccion'
   *       404:
   *         description: Transacción no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "No se encontró la transacción con id=10."
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/:id", transaccion.findOne);

  /**
   * @swagger
   * /transacciones/update/{id}:
   *   put:
   *     summary: Actualizar una transacción
   *     tags: [Transacciones]
   *     description: Actualiza la información de una transacción existente
   *     parameters:
   *       - $ref: '#/components/parameters/transaccionIdPath'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TransaccionCreate'
   *           example:
   *             metodo_pago: "transferencia"
   *             estado: "reembolsada"
   *     responses:
   *       200:
   *         description: Transacción actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Transacción actualizada correctamente."
   *       404:
   *         description: Transacción no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   */
  router.put("/update/:id", transaccion.update);

  /**
   * @swagger
   * /transacciones/delete/{id}:
   *   delete:
   *     summary: Eliminar una transacción por ID
   *     tags: [Transacciones]
   *     description: Elimina una transacción específica del sistema
   *     parameters:
   *       - $ref: '#/components/parameters/transaccionIdPath'
   *     responses:
   *       200:
   *         description: Transacción eliminada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Transacción eliminada correctamente."
   *       404:
   *         description: Transacción no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   */
  router.delete("/delete/:id", transaccion.delete);

  app.use("/api/transacciones", router);
};