module.exports = app => {
  const factura = require("../controllers/factura.controller.js");
  const router = require("express").Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Factura:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           readOnly: true
   *           description: ID autogenerado de la factura
   *         numero_factura:
   *           type: string
   *           readOnly: true
   *           description: Número único de factura generado automáticamente
   *           example: "F-1703052800000"
   *         id_venta:
   *           type: integer
   *           required: true
   *           description: ID de la venta asociada
   *         fecha_emision:
   *           type: string
   *           format: date-time
   *           readOnly: true
   *           description: Fecha de emisión automática
   *         venta:
   *           $ref: '#/components/schemas/Venta'
   *     Venta:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         total:
   *           type: number
   *           format: float
   *           description: Total de la venta
   *           example: 1500.50
   *         detalle_ventas:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/DetalleVenta'
   *     DetalleVenta:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         cantidad:
   *           type: integer
   *           description: Cantidad del producto
   *           example: 2
   *         precio_unitario:
   *           type: number
   *           format: float
   *           description: Precio unitario del producto
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
   *           description: Nombre del producto
   *           example: "Paracetamol"
   *     FacturaCreateRequest:
   *       type: object
   *       required:
   *         - id_venta
   *       properties:
   *         id_venta:
   *           type: integer
   *           description: ID de la venta para generar la factura
   *           example: 15
   *     FacturaResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *         factura:
   *           $ref: '#/components/schemas/Factura'
   *     PDFResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *         path:
   *           type: string
   *           description: Ruta donde se guardó el archivo PDF
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *   parameters:
   *     facturaIdPath:
   *       in: path
   *       name: id
   *       required: true
   *       schema:
   *         type: integer
   *       description: ID de la factura
   */

  /**
   * @swagger
   * tags:
   *   name: Facturas
   *   description: Gestión de facturas y generación de PDF
   */

  /**
   * @swagger
   * /facturas/create:
   *   post:
   *     summary: Crear una factura a partir de una venta
   *     tags: [Facturas]
   *     description: Genera una nueva factura con número único automático para una venta existente
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FacturaCreateRequest'
   *           example:
   *             id_venta: 15
   *     responses:
   *       201:
   *         description: Factura creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FacturaResponse'
   *             example:
   *               message: "Factura generada correctamente."
   *               factura:
   *                 id: 1
   *                 numero_factura: "F-1703052800000"
   *                 id_venta: 15
   *                 fecha_emision: "2023-12-20T10:30:00.000Z"
   *       404:
   *         description: Venta no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "Venta no encontrada."
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/create", factura.create);

  /**
   * @swagger
   * /facturas:
   *   get:
   *     summary: Obtener todas las facturas
   *     tags: [Facturas]
   *     description: Retorna la lista de todas las facturas ordenadas por fecha de emisión descendente
   *     responses:
   *       200:
   *         description: Lista de facturas obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Factura'
   *             example:
   *               - id: 1
   *                 numero_factura: "F-1703052800000"
   *                 id_venta: 15
   *                 fecha_emision: "2023-12-20T10:30:00.000Z"
   *                 venta:
   *                   id: 15
   *                   total: 2500.00
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/", factura.findAll);

  /**
   * @swagger
   * /facturas/{id}:
   *   get:
   *     summary: Obtener una factura por ID
   *     tags: [Facturas]
   *     description: Retorna la información completa de una factura específica incluyendo detalles de venta
   *     parameters:
   *       - $ref: '#/components/parameters/facturaIdPath'
   *     responses:
   *       200:
   *         description: Factura encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Factura'
   *       404:
   *         description: Factura no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               message: "No se encontró la factura con id=15."
   *       500:
   *         description: Error interno del servidor
   */
  router.get("/:id", factura.findOne);

  /**
   * @swagger
   * /facturas/delete/{id}:
   *   delete:
   *     summary: Eliminar una factura por ID
   *     tags: [Facturas]
   *     description: Elimina una factura específica del sistema
   *     parameters:
   *       - $ref: '#/components/parameters/facturaIdPath'
   *     responses:
   *       200:
   *         description: Factura eliminada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               success:
   *                 value:
   *                   message: "Factura eliminada correctamente."
   *               notFound:
   *                 value:
   *                   message: "No se encontró la factura con id=15."
   *       500:
   *         description: Error interno del servidor
   */
  router.delete("/delete/:id", factura.delete);

  /**
   * @swagger
   * /facturas/pdf/{id}:
   *   get:
   *     summary: Generar factura en PDF
   *     tags: [Facturas]
   *     description: Genera y descarga un archivo PDF con los detalles completos de la factura
   *     parameters:
   *       - $ref: '#/components/parameters/facturaIdPath'
   *     responses:
   *       200:
   *         description: PDF generado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PDFResponse'
   *             example:
   *               message: "Factura PDF generada correctamente."
   *               path: "/facturas/factura-1.pdf"
   *         headers:
   *           Content-Disposition:
   *             schema:
   *               type: string
   *             description: Indica que el contenido es un archivo para descargar
   *       404:
   *         description: Factura no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error al generar el PDF
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/pdf/:id", factura.generarFacturaPDF);
 

router.get("/ultima/:id", factura.obtenerUltimaVenta);

  app.use("/api/facturas", router);
};