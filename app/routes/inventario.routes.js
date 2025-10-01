module.exports = app => {
    const inventarios = require("../controllers/inventario.controller.js");
    var router = require("express").Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Inventario:
     *       type: object
     *       required:
     *         - cantidad
     *         - id_producto
     *         - id_sucursal
     *       properties:
     *         id:
     *           type: integer
     *           readOnly: true
     *           description: ID autogenerado del registro de inventario
     *         cantidad:
     *           type: integer
     *           description: Cantidad disponible en inventario
     *           minimum: 0
     *           example: 50
     *         id_producto:
     *           type: integer
     *           description: ID del producto relacionado
     *           example: 1
     *         id_sucursal:
     *           type: integer
     *           description: ID de la sucursal relacionada
     *           example: 1
     *         createdAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *     InventarioCreate:
     *       type: object
     *       required:
     *         - cantidad
     *         - id_producto
     *         - id_sucursal
     *       properties:
     *         cantidad:
     *           type: integer
     *           example: 100
     *         id_producto:
     *           type: integer
     *           example: 1
     *         id_sucursal:
     *           type: integer
     *           example: 1
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *   parameters:
     *     inventarioIdPath:
     *       in: path
     *       name: id
     *       required: true
     *       schema:
     *         type: integer
     *       description: ID del registro de inventario
     *     cantidadQuery:
     *       in: query
     *       name: cantidad
     *       required: false
     *       schema:
     *         type: integer
     *       description: Cantidad para filtrar registros de inventario
     */

    /**
     * @swagger
     * tags:
     *   name: Inventario
     *   description: Gestión de inventario de productos por sucursal
     */

    /**
     * @swagger
     * /inventario/create:
     *   post:
     *     summary: Crear un nuevo registro de inventario
     *     tags: [Inventario]
     *     description: Crea un nuevo registro de inventario para un producto en una sucursal específica
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/InventarioCreate'
     *           example:
     *             cantidad: 75
     *             id_producto: 5
     *             id_sucursal: 2
     *     responses:
     *       201:
     *         description: Registro de inventario creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Inventario'
     *       400:
     *         description: Datos de entrada inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "La cantidad, id_producto e id_sucursal son obligatorios."
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/create/", inventarios.create);

    /**
     * @swagger
     * /inventario:
     *   get:
     *     summary: Obtener todos los registros de inventario
     *     tags: [Inventario]
     *     description: Retorna la lista de todos los registros de inventario. Se puede filtrar por cantidad.
     *     parameters:
     *       - $ref: '#/components/parameters/cantidadQuery'
     *     responses:
     *       200:
     *         description: Lista de inventarios obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Inventario'
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/", inventarios.findAll);

    /**
     * @swagger
     * /inventario/{id}:
     *   get:
     *     summary: Obtener un registro de inventario por ID
     *     tags: [Inventario]
     *     description: Retorna la información de un registro de inventario específico
     *     parameters:
     *       - $ref: '#/components/parameters/inventarioIdPath'
     *     responses:
     *       200:
     *         description: Inventario encontrado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Inventario'
     *       404:
     *         description: Inventario no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/:id", inventarios.findOne);

    /**
     * @swagger
     * /inventario/update/{id}:
     *   put:
     *     summary: Actualizar un registro de inventario
     *     tags: [Inventario]
     *     description: Actualiza la información de un registro de inventario existente
     *     parameters:
     *       - $ref: '#/components/parameters/inventarioIdPath'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/InventarioCreate'
     *           example:
     *             cantidad: 60
     *             id_producto: 5
     *             id_sucursal: 2
     *     responses:
     *       200:
     *         description: Inventario actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Inventario actualizado correctamente."
     *       404:
     *         description: Inventario no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.put("/update/:id", inventarios.update);

    /**
     * @swagger
     * /inventario/delete/{id}:
     *   delete:
     *     summary: Eliminar un registro de inventario por ID
     *     tags: [Inventario]
     *     description: Elimina un registro de inventario específico del sistema
     *     parameters:
     *       - $ref: '#/components/parameters/inventarioIdPath'
     *     responses:
     *       200:
     *         description: Inventario eliminado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Inventario eliminado correctamente."
     *       404:
     *         description: Inventario no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/:id", inventarios.delete);

    /**
     * @swagger
     * /inventario/delete:
     *   delete:
     *     summary: Eliminar todos los registros de inventario
     *     tags: [Inventario]
     *     description: Elimina todos los registros de inventario del sistema (operación peligrosa)
     *     responses:
     *       200:
     *         description: Todos los registros de inventario eliminados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "25 registros de inventario fueron eliminados."
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/", inventarios.deleteAll);

    app.use("/api/inventario", router);
};