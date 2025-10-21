const authJwt = require("../middleware/verificarToken");
module.exports = app => {
    const usuarios = require("../controllers/usuario.controller.js");
    var router = require("express").Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     Usuario:
     *       type: object
     *       required:
     *         - nombre
     *         - correo
     *         - contrasena
     *       properties:
     *         id:
     *           type: integer
     *           readOnly: true
     *           description: ID autogenerado del usuario
     *         nombre:
     *           type: string
     *           description: Nombre completo del usuario
     *           example: "María González"
     *         correo:
     *           type: string
     *           format: email
     *           description: Correo electrónico del usuario
     *           example: "maria.gonzalez@empresa.com"
     *         contrasena:
     *           type: string
     *           format: password
     *           writeOnly: true
     *           description: Contraseña del usuario (se encripta automáticamente)
     *           minLength: 6
     *           example: "passwordSeguro123"
     *         puesto:
     *           type: string
     *           description: Puesto o cargo del usuario
     *           example: "Vendedor"
     *         telefono:
     *           type: string
     *           description: Número de teléfono del usuario
     *           example: "5555-1234"
     *         id_sucursal:
     *           type: integer
     *           description: ID de la sucursal asignada al usuario
     *           example: 1
     *         id_rol:
     *           type: integer
     *           description: ID del rol del usuario
     *           example: 2
     *         createdAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           readOnly: true
     *     UsuarioCreate:
     *       type: object
     *       required:
     *         - nombre
     *         - correo
     *         - contrasena
     *       properties:
     *         nombre:
     *           type: string
     *           example: "Carlos López"
     *         correo:
     *           type: string
     *           format: email
     *           example: "carlos.lopez@empresa.com"
     *         contrasena:
     *           type: string
     *           format: password
     *           example: "miContraseña123"
     *         puesto:
     *           type: string
     *           example: "Supervisor"
     *         telefono:
     *           type: string
     *           example: "5555-5678"
     *         id_sucursal:
     *           type: integer
     *           example: 2
     *         id_rol:
     *           type: integer
     *           example: 3
     *     UsuarioResponse:
     *       type: object
     *       properties:
     *         id:
     *           type: integer
     *         nombre:
     *           type: string
     *         correo:
     *           type: string
     *         puesto:
     *           type: string
     *         telefono:
     *           type: string
     *         id_sucursal:
     *           type: integer
     *         id_rol:
     *           type: integer
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
     *     usuarioIdPath:
     *       in: path
     *       name: id
     *       required: true
     *       schema:
     *         type: integer
     *       description: ID del usuario
     *     nombreQuery:
     *       in: query
     *       name: nombre
     *       required: false
     *       schema:
     *         type: string
     *       description: Nombre para filtrar usuarios (búsqueda parcial)
     */

    /**
     * @swagger
     * tags:
     *   name: Usuarios
     *   description: Gestión de usuarios del sistema
     */

    /**
     * @swagger
     * /usuario/create:
     *   post:
     *     summary: Crear un nuevo usuario
     *     tags: [Usuarios]
     *     description: Crea un nuevo usuario en el sistema. La contraseña se encripta automáticamente.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UsuarioCreate'
     *           example:
     *             nombre: "Ana Martínez"
     *             correo: "ana.martinez@empresa.com"
     *             contrasena: "password123"
     *             puesto: "Gerente"
     *             telefono: "5555-9999"
     *             id_sucursal: 1
     *             id_rol: 1
     *     responses:
     *       201:
     *         description: Usuario creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UsuarioResponse'
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
     */
    router.post("/create/", usuarios.create);

    /**
     * @swagger
     * /usuario:
     *   get:
     *     summary: Obtener todos los usuarios
     *     tags: [Usuarios]
     *     description: Retorna la lista de todos los usuarios. Se puede filtrar por nombre.
     *     parameters:
     *       - $ref: '#/components/parameters/nombreQuery'
     *     responses:
     *       200:
     *         description: Lista de usuarios obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UsuarioResponse'
     *             example:
     *               - id: 1
     *                 nombre: "María González"
     *                 correo: "maria.gonzalez@empresa.com"
     *                 puesto: "Vendedor"
     *                 telefono: "5555-1234"
     *                 id_sucursal: 1
     *                 id_rol: 2
     *                 createdAt: "2023-12-20T10:30:00.000Z"
     *                 updatedAt: "2023-12-20T10:30:00.000Z"
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/",authJwt.verifyToken, usuarios.findAll);

    /**
     * @swagger
     * /usuario/{id}:
     *   get:
     *     summary: Obtener un usuario por ID
     *     tags: [Usuarios]
     *     description: Retorna la información completa de un usuario específico
     *     parameters:
     *       - $ref: '#/components/parameters/usuarioIdPath'
     *     responses:
     *       200:
     *         description: Usuario encontrado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UsuarioResponse'
     *       404:
     *         description: Usuario no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "No se encontró el usuario con id=5."
     *       500:
     *         description: Error interno del servidor
     */
    router.get("/:id", authJwt.verifyToken,usuarios.findOne);

    /**
     * @swagger
     * /usuario/update/{id}:
     *   put:
     *     summary: Actualizar un usuario
     *     tags: [Usuarios]
     *     description: Actualiza la información de un usuario existente. La contraseña se encripta automáticamente si se modifica.
     *     parameters:
     *       - $ref: '#/components/parameters/usuarioIdPath'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UsuarioCreate'
     *           example:
     *             nombre: "María González Actualizada"
     *             puesto: "Supervisora"
     *             telefono: "5555-8888"
     *     responses:
     *       200:
     *         description: Usuario actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Usuario actualizado correctamente."
     *       404:
     *         description: Usuario no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.put("/update/:id", usuarios.update);

    /**
     * @swagger
     * /usuario/delete/{id}:
     *   delete:
     *     summary: Eliminar un usuario por ID
     *     tags: [Usuarios]
     *     description: Elimina un usuario específico del sistema
     *     parameters:
     *       - $ref: '#/components/parameters/usuarioIdPath'
     *     responses:
     *       200:
     *         description: Usuario eliminado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "Usuario eliminado correctamente."
     *       404:
     *         description: Usuario no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/:id", usuarios.delete);

    /**
     * @swagger
     * /usuario/delete:
     *   delete:
     *     summary: Eliminar todos los usuarios
     *     tags: [Usuarios]
     *     description: Elimina todos los usuarios del sistema (operación peligrosa)
     *     responses:
     *       200:
     *         description: Todos los usuarios eliminados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               message: "8 usuarios fueron eliminados."
     *       500:
     *         description: Error interno del servidor
     */
    router.delete("/delete/", usuarios.deleteAll);

    app.use("/api/usuario", router);
};