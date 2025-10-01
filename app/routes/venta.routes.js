module.exports = app => {
  const venta = require("../controllers/venta.controller.js");
  const router = require("express").Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Venta:
   *       type: object
   *       required:
   *         - id_usuario
   *         - detalles
   *       properties:
   *         id:
   *           type: integer
   *           readOnly: true
   *           description: ID autogenerado de la venta
   *         id_usuario:
   *           type: integer
   *           description: ID del usuario que realiza la venta
   *           example: 1
   *         id_cliente:
   *           type: integer
   *           description: ID del cliente (opcional)
   *           example: 5
   *         id_sucursal:
   *           type: integer
   *           description: ID de la sucursal donde se realiza la venta
   *           example: 1
   *         total:
   *           type: number
   *           format: float
   *           readOnly: true
   *           description: Total calculado automáticamente de la venta
   *           example: 1500.75
   *         fecha:
   *           type: string
   *           format: date-time
   *           readOnly: true
   *           description: Fecha y hora de la venta
   *         detalle_ventas:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/DetalleVenta'
   *     DetalleVenta:
   *       type: object
   *       required:
   *         - id_producto
   *         - cantidad
   *         - precio_unitario
   *       properties:
   *         id:
   *           type: integer
   *         id_producto:
   *           type: integer
   *           example: 10
   *         cantidad:
   *           type: integer
   *           minimum: 1
   *           example: 2
   *         precio_unitario:
   *           type: number
   *           format: float
   *           minimum: 0
   *           example: 750.25
   *         producto:
   *           $ref: '#/components/schemas/Producto'
   *     Producto:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         nombre:
   *           type: string
   *         precio_unitario:
   *           type: number
   *           format: float
   *     VentaCreate:
   *       type: object
   *       required:
   *         - id_usuario
   *         - detalles
   *       properties:
   *         id_usuario:
   *           type: integer
   *           example: 1
   *         id_cliente:
   *           type: integer
   *           example: 5
   *         id_sucursal:
   *           type: integer
   *           example: 1
   *         detalles:
   *           type: array
   *           minItems: 1
   *           items:
   *             type: object
   *             required:
   *               - id_producto
   *               - cantidad
   *               - precio_unitario
   *             properties:
   *               id_producto:
   *                 type: integer
   *                 example: 10
   *               cantidad:
   *                 type: integer
   *                 minimum: 1
   *                 example: 2
   *               precio_unitario:
   *                 type: number
   *                 format: float
   *                 minimum: 0
   *                 example: 750.25
   *     VentaResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *         ventaId:
   *           type: integer
   *         total:
   *           type: number
   *           format: float
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *   parameters:
   *     ventaIdPath:
   *       in: path
   *       name: id
   *       required: true
   *       schema:
   *         type: integer
   *       description: ID de la venta
   */

  /**
   * @swagger
   * tags:
   *   name: Ventas
   *   description: Gestión de ventas y detalles de venta del sistema
   */

  /**
   * @swagger
   * /ventas/create:
   *   post:
   *     summary: Crear una nueva venta
   *     tags: [Ventas]
   *     description: Registra una nueva venta con sus detalles de productos. El total se calcula automáticamente.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/VentaCreate'
   *           example:
   *             id_usuario: 2
   *             id_cliente: 8
   *             id_sucursal: 1
   *             detalles:
   *               - id_producto: 5
   *                 cantidad: 1
   *                 precio_unitario: 1200.00
   *               - id_producto: 12
   *                 cantidad: 3
   *                 precio_unitario: 150.50
   *     responses:
   *       201:
   *         description: Venta creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/VentaResponse'
   *             example:
   *               message: "Venta registrada correctamente"
   *               ventaId: 25
   *               total: 1651.50
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "La venta debe tener al menos un producto."
   *       500:
   *         description: Error interno del servidor
   */
  router.post("/create", venta.create);

  /**
   * @swagger
   * /ventas:
   *   get:
   *     summary: Obtener todas las ventas
   *     tags: [Ventas]
   *     description: Retorna la lista de todas las ventas ordenadas por fecha descendente, incluyendo detalles y productos
   *     responses:
   *       200:
   *         description: Lista de ventas obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Venta'
   *             example:
   *               - id: 25
   *                 id_usuario: 2
   *                 id_cliente: 8
   *                 id_sucursal: 1
   *                 total: 1651.50
   *                 fecha: "2023-12-20T14:30:00.000Z"
   *                 detalle_ventas:
   *                   - id: 1
   *                     id_producto: 5
   *                     cantidad: 1
   *                     precio_unitario: 1200.00
   *                     producto:
   *                       id: 5
   *                       nombre: "Laptop Dell XPS"
   *                       precio_unitario: 1200.00
   *                   - id: 2
   *                     id_producto: 12
   *                     cantidad: 3
   *                     precio_unitario: 150.50
   *                     producto:
   *                       id: 12
   *                       nombre: "Mouse Inalámbrico"
   *                       precio_unitario: 150.50
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/", venta.findAll);

  /**
   * @swagger
   * /ventas/{id}:
   *   get:
   *     summary: Obtener una venta por ID
   *     tags: [Ventas]
   *     description: Retorna la información completa de una venta específica incluyendo todos sus detalles y productos
   *     parameters:
   *       - $ref: '#/components/parameters/ventaIdPath'
   *     responses:
   *       200:
   *         description: Venta encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Venta'
   *       404:
   *         description: Venta no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "No se encontró la venta con id=25."
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/:id", venta.findOne);

  /**
   * @swagger
   * /ventas/update/{id}:
   *   put:
   *     summary: Actualizar una venta
   *     tags: [Ventas]
   *     description: Actualiza la información básica de una venta existente
   *     parameters:
   *       - $ref: '#/components/parameters/ventaIdPath'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id_cliente:
   *                 type: integer
   *               id_sucursal:
   *                 type: integer
   *           example:
   *             id_cliente: 10
   *             id_sucursal: 2
   *     responses:
   *       200:
   *         description: Venta actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Venta actualizada correctamente."
   *       404:
   *         description: Venta no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   */
  router.put("/update/:id", venta.update);

  /**
   * @swagger
   * /ventas/delete/{id}:
   *   delete:
   *     summary: Eliminar una venta por ID
   *     tags: [Ventas]
   *     description: Elimina una venta específica y todos sus detalles asociados
   *     parameters:
   *       - $ref: '#/components/parameters/ventaIdPath'
   *     responses:
   *       200:
   *         description: Venta eliminada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Venta eliminada correctamente."
   *       404:
   *         description: Venta no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error interno del servidor
   */
  router.delete("/delete/:id", venta.delete);

  app.use("/api/ventas", router);
};