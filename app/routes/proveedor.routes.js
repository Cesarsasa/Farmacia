module.exports = app => {
    const proveedor = require("../controllers/proveedor.controller.js");
    var router = require("express").Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Proveedor:
     *       type: object
     *       required:
     *         - nombre
     *       properties:
     *         id:
     *           type: integer
     *           readOnly: true
     *           description: ID autogenerado del proveedor
     *         nombre:
     *           type: string
     *           description: Nombre del proveedor
     *           example: "Tecnología S.A."
     *         contacto:
     *           type: string
     *           description: Nombre de la persona de contacto
     *           example: "Juan Pérez"
     *         telefono:
     *           type: string
     *           description: Número de teléfono del proveedor
     *           example: "5555-1234"
     *         correo:
     *           type: string
     *           format: email
     *           description: Correo electrónico del proveedor
     *           example: "contacto@tecnologia.com"
     *         createdAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *     ProveedorCreate:
     *       type: object
     *       required:
     *         - nombre
     *       properties:
     *         nombre:
     *           type: string
     *           example: "Electrónica Moderna"
     *         contacto:
     *           type: string
     *           example: "María García"
     *         telefono:
     *           type: string
     *           example: "5555-5678"
     *         correo:
     *           type: string
     *           format: email
     *           example: "ventas@electronicamoderna.com"
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *   parameters:
     *     proveedorIdPath:
     *       in: path
     *       name: id
     *       required: true
     *       schema:
     *         type: integer
     *       description: ID del proveedor
     *     nombreQuery:
     *       in: query
     *       name: nombre
     *       required: false
     *       schema:
     *         type: string
     *       description: Nombre para filtrar proveedores (búsqueda parcial)
     */

    /**
     * @swagger
     * tags:
     *   name: Proveedores
     *   description: Gestión de proveedores del sistema
     */

    /**
     * @swagger
     * /prov/create:
     *   post:
     *     summary: Crear un nuevo proveedor
     *     tags: [Proveedores]
     *     description: Agrega un nuevo proveedor al sistema
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ProveedorCreate'
     *           example:
     *             nombre: "Suministros Industriales Ltda."
     *             contacto: "Carlos Rodríguez"
     *             telefono: "2222-9999"
     *             correo: "carlos@suministros.com"
     *     responses:
     *       201:
     *         description: Proveedor creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Proveedor'
     *       400:
     *         description: Datos de entrada inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "El nombre del proveedor es obligatorio."
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/create/", proveedor.create);

    /**
     * @swagger
     * /prov:
     *   get:
     *     summary: Obtener todos los proveedores
     *     tags: [Proveedores]
     *     description: Retorna la lista de todos los proveedores. Se puede filtrar por nombre.
     *     parameters:
     *       - $ref: '#/components/parameters/nombreQuery'
     *     responses:
     *       200:
     *         description: Lista de proveedores obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Proveedor'
     *             example:
     *               - id: 1
     *                 nombre: "Tecnología S.A."
     *                 contacto: "Ana Martínez"
     *                 telefono: "5555-1234"
     *                 correo: "ana@tecnologia.com"
     *                 createdAt: "2023-12-20T10:30:00.000Z"
     *                 updatedAt: "2023-12-20T10:30:00.000Z"
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/", proveedor.findAll);

    /**
     * @swagger
     * /prov/{id}:
     *   get:
     *     summary: Obtener un proveedor por ID
     *     tags: [Proveedores]
     *     description: Retorna la información completa de un proveedor específico
     *     parameters:
     *       - $ref: '#/components/parameters/proveedorIdPath'
     *     responses:
     *       200:
     *         description: Proveedor encontrado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Proveedor'
     *       404:
     *         description: Proveedor no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "No se encontró el proveedor con id=5."
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/:id", proveedor.findOne);

    /**
     * @swagger
     * /prov/update/{id}:
     *   put:
     *     summary: Actualizar un proveedor
     *     tags: [Proveedores]
     *     description: Actualiza la información de un proveedor existente
     *     parameters:
     *       - $ref: '#/components/parameters/proveedorIdPath'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ProveedorCreate'
     *           example:
     *             nombre: "Tecnología S.A. Actualizado"
     *             contacto: "Laura Hernández"
     *             telefono: "5555-8888"
     *             correo: "laura@tecnologia.com"
     *     responses:
     *       200:
     *         description: Proveedor actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Proveedor actualizado correctamente."
     *       404:
     *         description: Proveedor no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.put("/update/:id", proveedor.update);

    /**
     * @swagger
     * /prov/delete/{id}:
     *   delete:
     *     summary: Eliminar un proveedor por ID
     *     tags: [Proveedores]
     *     description: Elimina un proveedor específico del sistema
     *     parameters:
     *       - $ref: '#/components/parameters/proveedorIdPath'
     *     responses:
     *       200:
     *         description: Proveedor eliminado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Proveedor eliminado correctamente."
     *       404:
     *         description: Proveedor no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/:id", proveedor.delete);

    /**
     * @swagger
     * /prov/delete:
     *   delete:
     *     summary: Eliminar todos los proveedores
     *     tags: [Proveedores]
     *     description: Elimina todos los proveedores del sistema (operación peligrosa)
     *     responses:
     *       200:
     *         description: Todos los proveedores eliminados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "8 proveedores fueron eliminados."
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/", proveedor.deleteAll);

    app.use("/api/prov", router);
};