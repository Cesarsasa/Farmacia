/*module.exports = app => {
  const carrito = require("../controllers/carrito.controller.js");
  const router = require("express").Router();

  // Agregar producto al carrito
  router.post("/agregar", carrito.agregar);

  // Ver contenido del carrito por cliente
  router.get("/ver/:id_cliente", carrito.verCarrito);

  // Actualizar cantidad de un producto en el carrito
  router.put("/actualizar", carrito.actualizarCantidad);

  // Eliminar producto del carrito
  router.delete("/eliminar", carrito.eliminarItem);

  // Vaciar carrito completo
  router.delete("/vaciar/:id_cliente", carrito.vaciarCarrito);

  // Confirmar compra (genera venta y detalle_venta)
  router.post("/confirmar", carrito.confirmarCompra);

  app.use("/api/carrito", router);
};*/

module.exports = app => {
  const carrito = require("../controllers/carrito.controller.js");
  const router = require("express").Router();

  /**
   * @swagger
   * /carrito/agregar:
   *   post:
   *     summary: Agrega un producto al carrito
   *     tags: [Carrito]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id_cliente, id_producto, cantidad]
   *             properties:
   *               id_cliente:
   *                 type: integer
   *               id_producto:
   *                 type: integer
   *               cantidad:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Producto agregado
   *       400:
   *         description: Datos incompletos
   *       500:
   *         description: Error interno
   */
  router.post("/agregar", carrito.agregar);

  /**
   * @swagger
   * /carrito/ver/{id_cliente}:
   *   get:
   *     summary: Ver contenido del carrito por cliente
   *     tags: [Carrito]
   *     parameters:
   *       - in: path
   *         name: id_cliente
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Lista de productos en el carrito
   *       500:
   *         description: Error interno
   */
  router.get("/ver/:id_cliente", carrito.verCarrito);

  /**
   * @swagger
   * /carrito/actualizar:
   *   put:
   *     summary: Actualiza la cantidad de un producto en el carrito
   *     tags: [Carrito]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id_cliente, id_producto, cantidad]
   *             properties:
   *               id_cliente:
   *                 type: integer
   *               id_producto:
   *                 type: integer
   *               cantidad:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Cantidad actualizada
   *       404:
   *         description: Producto no encontrado
   *       500:
   *         description: Error interno
   */
  router.put("/actualizar", carrito.actualizarCantidad);

  /**
   * @swagger
   * /carrito/eliminar:
   *   delete:
   *     summary: Elimina un producto del carrito
   *     tags: [Carrito]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id_cliente, id_producto]
   *             properties:
   *               id_cliente:
   *                 type: integer
   *               id_producto:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Producto eliminado
   *       500:
   *         description: Error interno
   */
  router.delete("/eliminar", carrito.eliminarItem);

  /**
   * @swagger
   * /carrito/vaciar/{id_cliente}:
   *   delete:
   *     summary: Vacía el carrito completo de un cliente
   *     tags: [Carrito]
   *     parameters:
   *       - in: path
   *         name: id_cliente
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Carrito vaciado
   *       500:
   *         description: Error interno
   */
  router.delete("/vaciar/:id_cliente", carrito.vaciarCarrito);

  /**
 * @swagger
 * /carrito/confirmar:
 *   post:
 *     summary: Confirma la compra y genera la venta
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cliente
 *               - id_usuario
 *               - id_sucursal
 *             properties:
 *               id_cliente:
 *                 type: integer
 *                 example: 101
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               id_sucursal:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Compra confirmada
 *       400:
 *         description: Carrito vacío
 *       500:
 *         description: Error interno
 */
  router.post("/confirmar", carrito.confirmarCompra);

  app.use("/api/carrito", router);
};