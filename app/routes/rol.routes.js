module.exports = app => {
    const rol = require("../controllers/rol.controller.js");
    var router = require("express").Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Rol:
     *       type: object
     *       required:
     *         - nombre
     *       properties:
     *         id:
     *           type: integer
     *           readOnly: true
     *           description: ID autogenerado del rol
     *         nombre:
     *           type: string
     *           description: Nombre del rol
     *           example: "Administrador"
     *         descripcion:
     *           type: string
     *           description: Descripción del rol y sus permisos
     *           example: "Acceso completo al sistema"
     *         createdAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *     RolCreate:
     *       type: object
     *       required:
     *         - nombre
     *       properties:
     *         nombre:
     *           type: string
     *           example: "Vendedor"
     *         descripcion:
     *           type: string
     *           example: "Puede gestionar ventas y clientes"
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         message:
     *           type: string
     *   parameters:
     *     rolIdPath:
     *       in: path
     *       name: id
     *       required: true
     *       schema:
     *         type: integer
     *       description: ID del rol
     *     nombreQuery:
     *       in: query
     *       name: nombre
     *       required: false
     *       schema:
     *         type: string
     *       description: Nombre para filtrar roles (búsqueda parcial)
     */

    /**
     * @swagger
     * tags:
     *   name: Roles
     *   description: Gestión de roles de usuario del sistema
     */

    /**
     * @swagger
     * /rol/create:
     *   post:
     *     summary: Crear un nuevo rol
     *     tags: [Roles]
     *     description: Crea un nuevo rol en el sistema para asignar permisos a usuarios
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RolCreate'
     *           example:
     *             nombre: "Supervisor"
     *             descripcion: "Puede supervisar ventas y gestionar inventario"
     *     responses:
     *       201:
     *         description: Rol creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Rol'
     *       400:
     *         description: Datos de entrada inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "El nombre del rol es obligatorio."
     *       500:
     *         description: Error interno del servidor
     */
    router.post("/create/", rol.create);

    /**
     * @swagger
     * /rol:
     *   get:
     *     summary: Obtener todos los roles
     *     tags: [Roles]
     *     description: Retorna la lista de todos los roles del sistema. Se puede filtrar por nombre.
     *     parameters:
     *       - $ref: '#/components/parameters/nombreQuery'
     *     responses:
     *       200:
     *         description: Lista de roles obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Rol'
     *             example:
     *               - id: 1
     *                 nombre: "Administrador"
     *                 descripcion: "Acceso completo al sistema"
     *                 createdAt: "2023-12-20T10:30:00.000Z"
     *                 updatedAt: "2023-12-20T10:30:00.000Z"
     *               - id: 2
     *                 nombre: "Vendedor"
     *                 descripcion: "Puede gestionar ventas y clientes"
     *                 createdAt: "2023-12-20T11:00:00.000Z"
     *                 updatedAt: "2023-12-20T11:00:00.000Z"
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/", rol.findAll);

    /**
     * @swagger
     * /rol/{id}:
     *   get:
     *     summary: Obtener un rol por ID
     *     tags: [Roles]
     *     description: Retorna la información completa de un rol específico
     *     parameters:
     *       - $ref: '#/components/parameters/rolIdPath'
     *     responses:
     *       200:
     *         description: Rol encontrado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Rol'
     *       404:
     *         description: Rol no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "No se encontró el rol con id=3."
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/:id", rol.findOne);

    /**
     * @swagger
     * /rol/update/{id}:
     *   put:
     *     summary: Actualizar un rol
     *     tags: [Roles]
     *     description: Actualiza la información de un rol existente
     *     parameters:
     *       - $ref: '#/components/parameters/rolIdPath'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RolCreate'
     *           example:
     *             nombre: "Vendedor Senior"
     *             descripcion: "Puede gestionar ventas, clientes y reportes"
     *     responses:
     *       200:
     *         description: Rol actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Rol actualizado correctamente."
     *       404:
     *         description: Rol no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.put("/update/:id", rol.update);

    /**
     * @swagger
     * /rol/delete/{id}:
     *   delete:
     *     summary: Eliminar un rol por ID
     *     tags: [Roles]
     *     description: Elimina un rol específico del sistema
     *     parameters:
     *       - $ref: '#/components/parameters/rolIdPath'
     *     responses:
     *       200:
     *         description: Rol eliminado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Rol eliminado correctamente."
     *       404:
     *         description: Rol no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/:id", rol.delete);

    /**
     * @swagger
     * /rol/delete:
     *   delete:
     *     summary: Eliminar todos los roles
     *     tags: [Roles]
     *     description: Elimina todos los roles del sistema (operación peligrosa)
     *     responses:
     *       200:
     *         description: Todos los roles eliminados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "5 roles fueron eliminados."
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/", rol.deleteAll);

    app.use("/api/rol", router);
};