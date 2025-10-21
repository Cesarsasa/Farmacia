const authJwt = require("../middleware/verificarToken");
module.exports = app => {
    const sucursals = require("../controllers/sucursal.controller.js");
    var router = require("express").Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Sucursal:
     *       type: object
     *       required:
     *         - nombre
     *       properties:
     *         id:
     *           type: integer
     *           readOnly: true
     *           description: ID autogenerado de la sucursal
     *         nombre:
     *           type: string
     *           description: Nombre de la sucursal
     *           example: "Sucursal Centro"
     *         direccion:
     *           type: string
     *           description: Dirección física de la sucursal
     *           example: "Avenida Principal 123, Zona 1"
     *         telefono:
     *           type: string
     *           description: Número de teléfono de la sucursal
     *           example: "5555-1234"
     *         createdAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *     SucursalCreate:
     *       type: object
     *       required:
     *         - nombre
     *       properties:
     *         nombre:
     *           type: string
     *           example: "Sucursal Norte"
     *         direccion:
     *           type: string
     *           example: "5ta calle 8-45, Zona 2"
     *         telefono:
     *           type: string
     *           example: "5555-5678"
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *   parameters:
     *     sucursalIdPath:
     *       in: path
     *       name: id
     *       required: true
     *       schema:
     *         type: integer
     *       description: ID de la sucursal
     *     nombreQuery:
     *       in: query
     *       name: nombre
     *       required: false
     *       schema:
     *         type: string
     *       description: Nombre para filtrar sucursales (búsqueda parcial)
     */

    /**
     * @swagger
     * tags:
     *   name: Sucursales
     *   description: Gestión de sucursales del sistema
     */

    /**
     * @swagger
     * /sucursal/create:
     *   post:
     *     summary: Crear una nueva sucursal
     *     tags: [Sucursales]
     *     description: Agrega una nueva sucursal al sistema
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SucursalCreate'
     *           example:
     *             nombre: "Sucursal Sur"
     *             direccion: "8va avenida 12-34, Zona 3"
     *             telefono: "5555-9999"
     *     responses:
     *       201:
     *         description: Sucursal creada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Sucursal'
     *       400:
     *         description: Datos de entrada inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "El nombre no puede estar vacío."
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/create/", sucursals.create);

    /**
     * @swagger
     * /sucursal:
     *   get:
     *     summary: Obtener todas las sucursales
     *     tags: [Sucursales]
     *     description: Retorna la lista de todas las sucursales. Se puede filtrar por nombre.
     *     parameters:
     *       - $ref: '#/components/parameters/nombreQuery'
     *     responses:
     *       200:
     *         description: Lista de sucursales obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Sucursal'
     *             example:
     *               - id: 1
     *                 nombre: "Sucursal Centro"
     *                 direccion: "Avenida Principal 123, Zona 1"
     *                 telefono: "5555-1234"
     *                 createdAt: "2023-12-20T10:30:00.000Z"
     *                 updatedAt: "2023-12-20T10:30:00.000Z"
     *               - id: 2
     *                 nombre: "Sucursal Norte"
     *                 direccion: "5ta calle 8-45, Zona 2"
     *                 telefono: "5555-5678"
     *                 createdAt: "2023-12-21T09:15:00.000Z"
     *                 updatedAt: "2023-12-21T09:15:00.000Z"
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/", sucursals.findAll);

    /**
     * @swagger
     * /sucursal/{id}:
     *   get:
     *     summary: Obtener una sucursal por ID
     *     tags: [Sucursales]
     *     description: Retorna la información completa de una sucursal específica
     *     parameters:
     *       - $ref: '#/components/parameters/sucursalIdPath'
     *     responses:
     *       200:
     *         description: Sucursal encontrada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Sucursal'
     *       404:
     *         description: Sucursal no encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "No se encontró la sucursal con id=5."
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/:id", sucursals.findOne);

    /**
     * @swagger
     * /sucursal/update/{id}:
     *   put:
     *     summary: Actualizar una sucursal
     *     tags: [Sucursales]
     *     description: Actualiza la información de una sucursal existente
     *     parameters:
     *       - $ref: '#/components/parameters/sucursalIdPath'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SucursalCreate'
     *           example:
     *             nombre: "Sucursal Centro Actualizada"
     *             direccion: "Avenida Principal 456, Zona 1"
     *             telefono: "5555-8888"
     *     responses:
     *       200:
     *         description: Sucursal actualizada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Sucursal actualizada correctamente."
     *       404:
     *         description: Sucursal no encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.put("/update/:id", sucursals.update);

    /**
     * @swagger
     * /sucursal/delete/{id}:
     *   delete:
     *     summary: Eliminar una sucursal por ID
     *     tags: [Sucursales]
     *     description: Elimina una sucursal específica del sistema
     *     parameters:
     *       - $ref: '#/components/parameters/sucursalIdPath'
     *     responses:
     *       200:
     *         description: Sucursal eliminada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Sucursal eliminada correctamente."
     *       404:
     *         description: Sucursal no encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/:id", sucursals.delete);

    /**
     * @swagger
     * /sucursal/delete:
     *   delete:
     *     summary: Eliminar todas las sucursales
     *     tags: [Sucursales]
     *     description: Elimina todas las sucursales del sistema (operación peligrosa)
     *     responses:
     *       200:
     *         description: Todas las sucursales eliminadas exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "3 sucursales fueron eliminadas."
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/", sucursals.deleteAll);

    app.use("/api/sucursal", router);
};