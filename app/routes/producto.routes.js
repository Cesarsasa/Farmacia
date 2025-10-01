module.exports = app => {
    const productos = require("../controllers/producto.controller.js");
    var router = require("express").Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Producto:
     *       type: object
     *       required:
     *         - nombre
     *         - precio_unitario
     *       properties:
     *         id:
     *           type: integer
     *           readOnly: true
     *           description: ID autogenerado del producto
     *         nombre:
     *           type: string
     *           description: Nombre del producto
     *           example: "Aspirina"
     *         descripcion:
     *           type: string
     *           description: Descripción detallada del producto
     *           example: "Tabletas de aspirina para aliviar el dolor y reducir la fiebre"
     *         precio_unitario:
     *           type: number
     *           format: float
     *           description: Precio unitario del producto
     *           minimum: 0
     *           example: 7.99
     *         id_proveedor:
     *           type: integer
     *           description: ID del proveedor del producto
     *           example: 3
     *         createdAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *     ProductoCreate:
     *       type: object
     *       required:
     *         - nombre
     *         - precio_unitario
     *       properties:
     *         nombre:
     *           type: string
     *           example: "Acetaminofén"
     *         descripcion:
     *           type: string
     *           example: "Medicamento para aliviar el dolor y reducir la fiebre"
     *         precio_unitario:
     *           type: number
     *           format: float
     *           example: 5.50
     *         id_proveedor:
     *           type: integer
     *           example: 2
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *   parameters:
     *     productoIdPath:
     *       in: path
     *       name: id
     *       required: true
     *       schema:
     *         type: integer
     *       description: ID del producto
     *     nombreQuery:
     *       in: query
     *       name: nombre
     *       required: false
     *       schema:
     *         type: string
     *       description: Nombre para filtrar productos (búsqueda parcial)
     */

    /**
     * @swagger
     * tags:
     *   name: Productos
     *   description: Gestión de catálogo de productos
     */

    /**
     * @swagger
     * /producto/create:
     *   post:
     *     summary: Crear un nuevo producto
     *     tags: [Productos]
     *     description: Agrega un nuevo producto al catálogo del sistema
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ProductoCreate'
     *           example:
     *             nombre: "Tylenol Extra Fuerte"
     *             descripcion: "Medicamento para aliviar dolores fuertes"
     *             precio_unitario: 899.99
     *             id_proveedor: 1
     *     responses:
     *       201:
     *         description: Producto creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Producto'
     *       400:
     *         description: Datos de entrada inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "El nombre y precio unitario son obligatorios."
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/create/", productos.create);

    /**
     * @swagger
     * /producto:
     *   get:
     *     summary: Obtener todos los productos
     *     tags: [Productos]
     *     description: Retorna la lista de todos los productos. Se puede filtrar por nombre.
     *     parameters:
     *       - $ref: '#/components/parameters/nombreQuery'
     *     responses:
     *       200:
     *         description: Lista de productos obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Producto'
     *             example:
     *               - id: 1
     *                 nombre: "Centrum"
     *                 descripcion: "Multivitamico en Tabletas"
     *                 precio_unitario: 500.00
     *                 id_proveedor: 2
     *                 createdAt: "2023-12-20T10:30:00.000Z"
     *                 updatedAt: "2023-12-20T10:30:00.000Z"
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/", productos.findAll);

    /**
     * @swagger
     * /producto/{id}:
     *   get:
     *     summary: Obtener un producto por ID
     *     tags: [Productos]
     *     description: Retorna la información completa de un producto específico
     *     parameters:
     *       - $ref: '#/components/parameters/productoIdPath'
     *     responses:
     *       200:
     *         description: Producto encontrado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Producto'
     *       404:
     *         description: Producto no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "No se encontró el producto con id=15."
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/:id", productos.findOne);

    /**
     * @swagger
     * /producto/update/{id}:
     *   put:
     *     summary: Actualizar un producto
     *     tags: [Productos]
     *     description: Actualiza la información de un producto existente
     *     parameters:
     *       - $ref: '#/components/parameters/productoIdPath'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ProductoCreate'
     *           example:
     *             nombre: "Hidroxon"
     *             descripcion: "Electrolitos para rehidratar"
     *             precio_unitario: 25.00
     *     responses:
     *       200:
     *         description: Producto actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Producto actualizado correctamente."
     *       404:
     *         description: Producto no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.put("/update/:id", productos.update);

    /**
     * @swagger
     * /producto/delete/{id}:
     *   delete:
     *     summary: Eliminar un producto por ID
     *     tags: [Productos]
     *     description: Elimina un producto específico del catálogo
     *     parameters:
     *       - $ref: '#/components/parameters/productoIdPath'
     *     responses:
     *       200:
     *         description: Producto eliminado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Producto eliminado correctamente."
     *       404:
     *         description: Producto no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/:id", productos.delete);

    /**
     * @swagger
     * /producto/delete:
     *   delete:
     *     summary: Eliminar todos los productos
     *     tags: [Productos]
     *     description: Elimina todos los productos del catálogo (operación peligrosa)
     *     responses:
     *       200:
     *         description: Todos los productos eliminados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "45 productos fueron eliminados."
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/", productos.deleteAll);

    app.use("/api/producto", router);
};